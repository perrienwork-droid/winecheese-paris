#!/usr/bin/env python3
"""Genere les creneaux de la page couple a partir d'une source unique (S6).

Source : _project/slots.json. Une saisie par jour ouvert, rien d'autre.
Cible  : private-wine-tasting-for-two.html, a deux endroits que ce script
         reecrit ensemble, si bien qu'ils ne peuvent plus se contredire :
           1. le bloc visible entre <!-- SLOTS:START --> et <!-- SLOTS:END -->
           2. les objets Event du JSON-LD du <head>

Toute date passee est ecartee a la generation : un jour dont la reservation
est close (midi, heure de Paris, le jour meme) n'est plus ecrit nulle part.
Chaque Offer porte en plus un validThrough a cette meme coupure, de sorte
qu'une page qui n'aurait pas ete regeneree reste lisible comme expiree.

Usage, depuis la racine du depot :
  python3 _project/build-slots.py           # reecrit la page
  python3 _project/build-slots.py --check   # ne touche a rien, echoue si la
                                            # page n'est pas a jour ou sert
                                            # une date close
Aucune dependance hors bibliotheque standard (Python 3.9 ou plus).
"""
import argparse
import json
import re
import sys
from datetime import date, datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parent.parent
PAGE = ROOT / "private-wine-tasting-for-two.html"
SOURCE = ROOT / "_project" / "slots.json"
PARIS = ZoneInfo("Europe/Paris")

STRIPE = "https://buy.stripe.com/00weVf6Gx0BTaWE4DZb3q01"
BASE = "https://winecheese.paris/private-wine-tasting-for-two"
PRICE = "390"
BOOKING_CUTOFF_HOUR = 12        # la reservation ferme a midi le jour meme
EARLIEST_MON_TO_WED = 16        # contrainte de la cave, lundi a mercredi
DURATION_H = 2
# Le JSON-LD ne porte que les creneaux des prochaines semaines : la page n'est pas
# compressee par le serveur, et 200 Event pesaient 340 Ko. Les cartes, elles, gardent
# toutes les dates ouvertes (le calendrier en a besoin). Un sous-ensemble ne contredit
# rien : chaque Event annonce reste reservable.
LD_HORIZON_DAYS = 28

DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
MONTHS = ["January", "February", "March", "April", "May", "June", "July",
          "August", "September", "October", "November", "December"]

CHAIN_NOTE = (
    '<p class="priv-slots-chain-note">Each Saturday and Sunday below is a pair: one run of five '
    'bottles, opened Saturday and kept under vacuum overnight rather than resealed with a cork. '
    'Book either day of a pair for the same five wines, the same five pairings, the same €390. '
    "Sunday's pour is not a leftover, it is the same wine a day further into the air, and that is "
    'usually the more interesting glass, not the lesser one.</p>'
)

EMPTY_BLOCK = (
    '<div class="cal-empty">\n'
    '        <p class="cal-empty-h">Nothing open yet</p>\n'
    '        <p class="cal-empty-b">I open dates a few weeks ahead, always as two consecutive days on the '
    'same five bottles. If you already have a date in mind, ask me and I will tell you straight away.</p>\n'
    '        <a class="cal-empty-link" href="contact.html?enquiry=private-couples" data-enquiry>Ask about a date that is not listed</a>\n'
    '      </div>'
)


class SlotsError(Exception):
    pass


def hour_label(h):
    suffix = "am" if h < 12 else "pm"
    h12 = h % 12 or 12
    return f"{h12}:00{suffix}"


def parse_source(raw):
    pairs = raw.get("pairs")
    if not isinstance(pairs, list):
        raise SlotsError("slots.json : la cle 'pairs' doit etre une liste")
    out = []
    seen = set()
    for i, pair in enumerate(pairs, 1):
        if not isinstance(pair, list) or not 1 <= len(pair) <= 2:
            raise SlotsError(f"paire {i} : une liste d'un ou deux jours")
        days = []
        for day in pair:
            try:
                d = date.fromisoformat(day["date"])
            except (KeyError, TypeError, ValueError):
                raise SlotsError(f"paire {i} : date absente ou illisible ({day!r})")
            if d in seen:
                raise SlotsError(f"{d} : jour present deux fois")
            seen.add(d)
            hours = []
            for t in day.get("times") or []:
                m = re.fullmatch(r"(\d{1,2}):00", str(t))
                if not m:
                    raise SlotsError(f"{d} : horaire {t!r} invalide, attendu HH:00")
                h = int(m.group(1))
                if not 9 <= h <= 21:
                    raise SlotsError(f"{d} : horaire {t} hors de la journee")
                if d.weekday() <= 2 and h < EARLIEST_MON_TO_WED:
                    raise SlotsError(f"{d} ({DAYS[d.weekday()]}) : rien avant {EARLIEST_MON_TO_WED}h du lundi au mercredi")
                hours.append(h)
            if not hours:
                raise SlotsError(f"{d} : aucun horaire")
            if len(set(hours)) != len(hours):
                raise SlotsError(f"{d} : horaire en double")
            days.append((d, sorted(hours)))
        days.sort()
        if len(days) == 2 and days[1][0] - days[0][0] != timedelta(days=1):
            raise SlotsError(f"paire {i} : {days[0][0]} et {days[1][0]} ne sont pas consecutifs")
        out.append(days)
    out.sort(key=lambda p: p[0][0])
    return out


def cutoff_of(d):
    return datetime(d.year, d.month, d.day, BOOKING_CUTOFF_HOUR, tzinfo=PARIS)


def is_open(d, now):
    """Vrai tant que la reservation de ce jour n'est pas close."""
    return now < cutoff_of(d)


def keep_future(pairs, now):
    kept = []
    for p in pairs:
        days = [(d, hrs) for d, hrs in p if is_open(d, now)]
        if days:
            kept.append(days)
    return kept


def slot_id(d, h):
    return f"{DAYS[d.weekday()][:3].lower()}-{d.isoformat()}-{h:02d}00"


def render_cards(pairs):
    if not pairs:
        return "      " + EMPTY_BLOCK
    lines = ["      " + CHAIN_NOTE]
    for p in pairs:
        lines.append('      <div class="slots-pair">')
        for d, hours in p:
            label = f"{DAYS[d.weekday()]} {d.day} {MONTHS[d.month - 1]} {d.year}"
            lines.append(f'<div class="slots-day-group"><p class="slots-day-label">{label}</p><div class="slots-grid">')
            for h in hours:
                sid = slot_id(d, h)
                lines.append(
                    f'<div class="slot-card"><div><p class="slot-label">{hour_label(h)} to {hour_label(h + DURATION_H)}</p>'
                    '<p class="slot-sub">Private, just the two of you</p></div>'
                    f'<a class="btn-book-slot" data-slot="{sid}" href="{STRIPE}?client_reference_id={sid}">Book this slot, &euro;{PRICE}</a></div>')
            lines.append('</div></div>')
        lines.append('      </div>')
    return "\n".join(lines)


def iso(dt):
    return dt.isoformat(timespec="seconds")


def render_events(pairs, valid_from):
    events = []
    horizon = valid_from.date() + timedelta(days=LD_HORIZON_DAYS)
    for p in pairs:
        for d, hours in p:
            if d > horizon:
                continue
            for h in hours:
                start = datetime(d.year, d.month, d.day, h, tzinfo=PARIS)
                end = start + timedelta(hours=DURATION_H)
                events.append({
                    "@context": "https://schema.org",
                    "@type": "Event",
                    "@id": f"{BASE}#{d.isoformat()}-{h:02d}00",
                    "name": "Private Wine and Cheese Tasting for Two, Montmartre Cellar",
                    "description": "A two-hour private wine and cheese tasting for two guests in an underground cellar at the foot of Montmartre. Five wines, five pairings, hosted in English by a WSET-certified Parisian.",
                    "url": f"{BASE}.html",
                    "startDate": iso(start),
                    "endDate": iso(end),
                    "duration": f"PT{DURATION_H}H",
                    "eventStatus": "https://schema.org/EventScheduled",
                    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
                    "inLanguage": "en",
                    "maximumAttendeeCapacity": 2,
                    "isAccessibleForFree": False,
                    "typicalAgeRange": "18-",
                    "location": {
                        "@type": "Place",
                        "name": "Cave Les Piqueurs",
                        "address": {
                            "@type": "PostalAddress",
                            "streetAddress": "6 rue Tardieu",
                            "addressLocality": "Paris",
                            "postalCode": "75018",
                            "addressCountry": "FR",
                        },
                        "publicAccess": False,
                    },
                    "organizer": {"@id": "https://winecheese.paris/#organization"},
                    "performer": {"@id": "https://winecheese.paris/#thomas"},
                    "offers": {
                        "@type": "Offer",
                        "name": "Private tasting for two, all inclusive",
                        "price": PRICE,
                        "priceCurrency": "EUR",
                        "description": "Total price for the two guests. Five wines, cheese board, bread, walnuts, raisins, water and private use of the cellar included.",
                        "availability": "https://schema.org/InStock",
                        "validFrom": iso(valid_from),
                        "validThrough": iso(cutoff_of(d)),
                        "url": f"{BASE}.html",
                    },
                })
    return events


LD_RE = re.compile(r'(<script type="application/ld\+json">\n)(.*?)(\n</script>)', re.S)
SLOTS_RE = re.compile(r"(<!-- SLOTS:START -->\n)(.*?)(\n[ \t]*<!-- SLOTS:END -->)", re.S)


def split_array(text):
    """Decoupe le tableau JSON-LD en objets, en gardant le texte source de chacun."""
    dec = json.JSONDecoder()
    i = text.index("[") + 1
    items = []
    while True:
        while text[i] in " \t\r\n,":
            i += 1
        if text[i] == "]":
            return items
        obj, end = dec.raw_decode(text, i)
        items.append((obj, text[i:end]))
        i = end


def rebuild_ld(ld_text, events):
    """Garde les objets non Event tels quels, au caractere pres, et regenere les Event
    juste avant la FAQPage."""
    kept = [(o, src) for o, src in split_array(ld_text) if o.get("@type") != "Event"]
    pos = next((k for k, (o, _) in enumerate(kept) if o.get("@type") == "FAQPage"), len(kept))
    fresh = []
    for e in events:
        fresh.append(json.dumps(e, ensure_ascii=False, separators=(",", ":")))
    blocks = [src for _, src in kept[:pos]] + fresh + [src for _, src in kept[pos:]]
    out = "[\n" + ",\n".join("  " + b for b in blocks) + "\n]"
    out = out.replace("</", "<\\/")
    json.loads(out)  # garde-fou : le bloc doit rester du JSON valide
    return out


def build(page_text, pairs, now):
    future = keep_future(pairs, now)
    valid_from = datetime(now.year, now.month, now.day, tzinfo=PARIS)
    m = SLOTS_RE.search(page_text)
    if not m:
        raise SlotsError("marqueurs SLOTS:START / SLOTS:END introuvables dans la page")
    page_text = page_text[:m.start(2)] + render_cards(future) + page_text[m.end(2):]
    m = LD_RE.search(page_text)
    if not m:
        raise SlotsError("bloc JSON-LD introuvable dans la page")
    page_text = page_text[:m.start(2)] + rebuild_ld(m.group(2), render_events(future, valid_from)) + page_text[m.end(2):]
    return page_text, future


def served_dates(page_text):
    """Les dates encore ecrites dans la page, cartes et JSON-LD confondus."""
    found = set(re.findall(r'data-slot="[a-z]{3}-(\d{4}-\d{2}-\d{2})-\d{4}"', page_text))
    m = LD_RE.search(page_text)
    if m:
        for obj, _ in split_array(m.group(2)):
            if obj.get("@type") == "Event":
                found.add(obj["startDate"][:10])
    return sorted(found)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--check", action="store_true", help="verifier sans ecrire")
    ap.add_argument("--now", help="date et heure de reference, ISO, heure de Paris (tests)")
    args = ap.parse_args()

    now = datetime.fromisoformat(args.now).replace(tzinfo=PARIS) if args.now else datetime.now(PARIS)
    try:
        pairs = parse_source(json.loads(SOURCE.read_text(encoding="utf-8")))
        current = PAGE.read_text(encoding="utf-8")
        new, future = build(current, pairs, now)
    except (SlotsError, json.JSONDecodeError) as e:
        print(f"ERREUR : {e}", file=sys.stderr)
        return 2

    stale = [d for d in served_dates(current) if not is_open(date.fromisoformat(d), now)]
    n_slots = sum(len(h) for p in future for _, h in p)
    n_events = len(render_events(future, datetime(now.year, now.month, now.day, tzinfo=PARIS)))
    n_days = sum(len(p) for p in future)

    if args.check:
        problems = []
        if stale:
            problems.append(f"dates closes encore servies : {', '.join(stale)}")
        if new != current:
            problems.append("la page n'est pas a jour avec slots.json, lancer le script sans --check")
        if problems:
            for p in problems:
                print(f"ECHEC : {p}", file=sys.stderr)
            return 1
        print(f"OK : {n_slots} creneaux sur {n_days} jours, aucune date close servie.")
        return 0

    if new != current:
        PAGE.write_text(new, encoding="utf-8")
    msg = f"Page ecrite : {n_slots} creneaux sur {n_days} jours ouverts, {n_events} Event dans le JSON-LD ({LD_HORIZON_DAYS} jours)"
    if stale:
        msg += f", {len(stale)} jour(s) clos retire(s) ({', '.join(stale)})"
    print(msg + ".")
    if not future:
        print("Aucune date ouverte : la page affiche l'etat vide et le lien de demande.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
