import { useState, useMemo } from 'react';
import { useListVenues, useRequestVenueBooking } from '@workspace/api-client-react';
import type { Venue } from '@workspace/api-client-react';
import { MapPin, Users, Loader2, X, ArrowUpDown, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as Dialog from '@radix-ui/react-dialog';

type SortMode = 'default' | 'price-asc' | 'price-desc';

const TYPE_FILTERS = ['All', 'Luxury Hotel', 'Soundstage', 'Outdoor Location', 'Beach Location', 'Landmark Location', 'Rooftop', 'Theatre', 'Recording Studio'];

// Real Unsplash images for venue types
const VENUE_IMAGES: Record<string, string> = {
  'vp1': 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80',   // Burj Al Arab style
  'vp2': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80',   // Palm Atlantis style
  'vp3': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80',   // Burj Khalifa
  'vp4': 'https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?w=600&q=80',   // Jumeirah Beach Hotel
  'vp5': 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&q=80',      // luxury hotel interior
  'vp6': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80',   // palm resort garden
  'vp7': 'https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?w=600&q=80',   // rooftop pool skyline
  'vp8': 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&q=80',      // luxury hotel atrium
  'v1':  'https://images.unsplash.com/photo-1621609764180-2ca554a9d6f2?w=600&q=80',   // soundstage
  'v2':  'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&q=80',   // studio
  'v3':  'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=600&q=80',   // desert dunes
  'v4':  'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=600&q=80',      // dubai marina
  'v5':  'https://images.unsplash.com/photo-1548013146-72479768bada?w=600&q=80',      // old town heritage
  'v7':  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80',   // theatre
  'v8':  'https://images.unsplash.com/photo-1598653222000-6b7b7a552625?w=600&q=80',   // recording studio
  'v9':  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80',   // beach
  'v10': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80',   // frame/landmark
  'v11': 'https://images.unsplash.com/photo-1560472355-536de3962603?w=600&q=80',      // led studio
  'v12': 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=600&q=80',      // creek boats
};

export default function Venues() {
  const { data: venues, isLoading } = useListVenues();
  const { mutate: bookVenue, isPending } = useRequestVenueBooking();
  const { toast } = useToast();

  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [sort, setSort] = useState<SortMode>('default');
  const [typeFilter, setTypeFilter] = useState('All');

  const formatAed = (val: number) =>
    new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED', maximumFractionDigits: 0 }).format(val);

  const featured = useMemo(() =>
    (venues ?? []).filter((v) => (v as any).tags?.includes('featured')),
  [venues]);

  const regular = useMemo(() => {
    let list = (venues ?? []).filter((v) => !(v as any).tags?.includes('featured'));
    if (typeFilter !== 'All') list = list.filter((v) => v.type === typeFilter);
    if (sort === 'price-asc') list = [...list].sort((a, b) => a.dayRateAed - b.dayRateAed);
    if (sort === 'price-desc') list = [...list].sort((a, b) => b.dayRateAed - a.dayRateAed);
    return list;
  }, [venues, sort, typeFilter]);

  const handleBook = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedVenue) return;
    const f = new FormData(e.currentTarget);
    bookVenue(
      {
        id: selectedVenue.id,
        data: {
          startDate: f.get('startDate') as string,
          endDate: f.get('endDate') as string,
          productionTitle: f.get('productionTitle') as string,
          contactEmail: f.get('contactEmail') as string,
          notes: f.get('notes') as string,
        },
      },
      {
        onSuccess: () => {
          toast({ title: 'Enquiry submitted', description: 'The venue team will contact you within 24 hours.' });
          setSelectedVenue(null);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-32">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full">

      {/* ── Page header ─────────────────────────────────────────────── */}
      <div className="container mx-auto px-6 md:px-10 py-12">
        <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-muted-foreground mb-2">Locations</p>
        <h1 className="text-3xl md:text-4xl font-light mb-4">Venues & Locations</h1>
        <div className="h-px w-10 bg-primary"></div>
        <p className="text-sm text-muted-foreground font-light mt-4">
          Pre-approved government, luxury and private studio spaces — permits coordinated through the Gateway.
        </p>
      </div>

      {/* ── Featured: Jumeirah / iconic properties ───────────────────── */}
      {featured.length > 0 && (
        <section className="border-y border-border bg-secondary">
          <div className="container mx-auto px-6 md:px-10 py-10">
            <div className="flex items-center gap-3 mb-7">
              <Star className="h-3.5 w-3.5 text-primary fill-primary" />
              <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-muted-foreground">
                Premier Properties — Jumeirah, Kerzner &amp; Iconic Dubai
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {featured.map((venue) => (
                <div
                  key={venue.id}
                  className="bg-white border border-card-border overflow-hidden group cursor-pointer hover:border-foreground/30 transition-colors"
                  onClick={() => venue.available && setSelectedVenue(venue)}
                >
                  <div className="relative h-40 overflow-hidden bg-secondary">
                    {VENUE_IMAGES[venue.id] ? (
                      <img
                        src={VENUE_IMAGES[venue.id]}
                        alt={venue.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No image</div>
                    )}
                    {!venue.available && (
                      <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                        <span className="text-[9px] font-semibold tracking-widest uppercase text-foreground/60">Hold / Unavailable</span>
                      </div>
                    )}
                    <div className="absolute top-2 left-2">
                      <span className="bg-black/70 text-white text-[8px] tracking-widest uppercase px-2 py-0.5 font-semibold">{venue.type}</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-medium leading-tight mb-1">{venue.name}</h3>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {venue.location}
                      </p>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-primary">{formatAed(venue.dayRateAed)}</p>
                        <p className="text-[9px] text-muted-foreground uppercase tracking-wide">/ day</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── All venues — with sort & type filter ─────────────────────── */}
      <div className="container mx-auto px-6 md:px-10 py-10">

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-7">
          {/* Type filter */}
          <div className="flex flex-wrap gap-1.5">
            {TYPE_FILTERS.filter(t => t !== 'Luxury Hotel').map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`text-[9px] font-medium tracking-[0.14em] uppercase px-2.5 py-1 border transition-colors ${
                  typeFilter === t
                    ? 'bg-foreground text-background border-foreground'
                    : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2 shrink-0">
            <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortMode)}
              className="text-[11px] tracking-[0.1em] uppercase border border-input bg-background px-2 py-1 focus:outline-none focus:ring-1 focus:ring-ring h-8"
            >
              <option value="default">Sort: Default</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
            </select>
          </div>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {regular.map((venue) => (
            <div
              key={venue.id}
              className="bg-white border border-card-border flex flex-col overflow-hidden group hover:border-foreground/30 transition-colors"
            >
              {/* Image */}
              <div className="relative h-44 bg-secondary overflow-hidden">
                {VENUE_IMAGES[venue.id] ? (
                  <img
                    src={VENUE_IMAGES[venue.id]}
                    alt={venue.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No image</div>
                )}
                <div className="absolute top-3 right-3">
                  <span className="bg-white/90 text-[9px] tracking-widest uppercase px-2 py-0.5 font-semibold border border-border">
                    {venue.type}
                  </span>
                </div>
              </div>

              <div className="p-5 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-sm font-medium leading-snug">{venue.name}</h3>
                  <div className="text-right shrink-0 ml-3">
                    <p className="text-base font-semibold text-primary">{formatAed(venue.dayRateAed)}</p>
                    <p className="text-[9px] text-muted-foreground uppercase tracking-widest">/ day</p>
                  </div>
                </div>

                <div className="flex gap-3 text-[11px] text-muted-foreground mb-3">
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{venue.location}</span>
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" />Cap. {venue.capacity}</span>
                </div>

                <p className="text-xs text-foreground/70 font-light leading-relaxed line-clamp-2 flex-1 mb-4">
                  {venue.description}
                </p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {venue.tags.filter(t => t !== 'featured').slice(0, 3).map((tag) => (
                    <span key={tag} className="bg-secondary text-[9px] tracking-widest uppercase px-2 py-0.5 border border-border text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => setSelectedVenue(venue)}
                  disabled={!venue.available}
                  className="w-full h-9 border border-primary text-primary text-[11px] font-medium tracking-[0.12em] uppercase hover:bg-primary hover:text-white transition-colors disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-primary"
                >
                  {venue.available ? 'Request Booking' : 'Currently Unavailable'}
                </button>
              </div>
            </div>
          ))}

          {regular.length === 0 && (
            <div className="col-span-full py-16 text-center text-muted-foreground border border-dashed border-border text-sm">
              No venues match the selected filter.
            </div>
          )}
        </div>
      </div>

      {/* Booking dialog */}
      <Dialog.Root open={!!selectedVenue} onOpenChange={(open) => !open && setSelectedVenue(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in" />
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] bg-white border border-card-border shadow-xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-border flex justify-between items-start bg-secondary">
              <div>
                <Dialog.Title className="text-base font-medium">{selectedVenue?.name}</Dialog.Title>
                <Dialog.Description className="text-xs text-muted-foreground mt-0.5">
                  {selectedVenue?.location} · {selectedVenue && formatAed(selectedVenue.dayRateAed)}/day
                </Dialog.Description>
              </div>
              <Dialog.Close asChild>
                <button className="text-muted-foreground hover:text-foreground mt-0.5">
                  <X className="h-4 w-4" />
                </button>
              </Dialog.Close>
            </div>

            <div className="p-6 overflow-y-auto">
              <form onSubmit={handleBook} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-medium tracking-[0.14em] uppercase text-muted-foreground block mb-1.5">Start Date</label>
                    <input required type="date" name="startDate" className="flex h-9 w-full border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
                  </div>
                  <div>
                    <label className="text-[10px] font-medium tracking-[0.14em] uppercase text-muted-foreground block mb-1.5">End Date</label>
                    <input required type="date" name="endDate" className="flex h-9 w-full border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-medium tracking-[0.14em] uppercase text-muted-foreground block mb-1.5">Production Title</label>
                  <input required name="productionTitle" className="flex h-9 w-full border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
                </div>
                <div>
                  <label className="text-[10px] font-medium tracking-[0.14em] uppercase text-muted-foreground block mb-1.5">Contact Email</label>
                  <input required type="email" name="contactEmail" className="flex h-9 w-full border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
                </div>
                <div>
                  <label className="text-[10px] font-medium tracking-[0.14em] uppercase text-muted-foreground block mb-1.5">Notes</label>
                  <textarea name="notes" rows={3} className="flex w-full border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none" />
                </div>
                <div className="pt-3 flex justify-end">
                  <button type="submit" disabled={isPending} className="h-9 px-6 bg-primary text-white text-[11px] font-medium tracking-[0.12em] uppercase hover:bg-primary/90 flex items-center gap-2">
                    {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Submit Enquiry
                  </button>
                </div>
              </form>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
