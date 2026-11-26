import { useEffect, useMemo, useState } from 'react'
import { AirplaneTilt, Backpack, CalendarBlank, MapPin, Money, NotePencil, Plus, Trash, X, GlobeHemisphereWest } from '@phosphor-icons/react'
import { useI18n } from './i18n'

type Day = { id: string; title: string; activities: string[] }
type Expense = { id: string; name: string; amount: number; category: string }
type Trip = { id: string; name: string; destination: string; start: string; end: string; budget: number; currency: string; days: Day[]; expenses: Expense[]; packing: { id: string; label: string; done: boolean }[]; notes: { id: string; text: string }[] }

const SAMPLE_DESTINATIONS: { en: string; ar: string; note: { en: string; ar: string } }[] = [
  { en: 'Cairo, Egypt', ar: 'القاهرة، مصر', note: { en: 'Museums, old streets and the Nile', ar: 'متاحف وشوارع قديمة ونهر النيل' } },
  { en: 'Alexandria, Egypt', ar: 'الإسكندرية، مصر', note: { en: 'Corniche walks and seafood', ar: 'كورنيش ومأكولات بحرية' } },
  { en: 'Luxor, Egypt', ar: 'الأقصر، مصر', note: { en: 'Temples and tombs along the Nile', ar: 'معابد ومقابر على ضفاف النيل' } },
  { en: 'Sharm El Sheikh, Egypt', ar: 'شرم الشيخ، مصر', note: { en: 'Beaches and diving', ar: 'شواطئ وغوص' } },
  { en: 'Istanbul, Türkiye', ar: 'إسطنبول، تركيا', note: { en: 'Old city, bazaars and the Bosphorus', ar: 'مدينة قديمة وأسواق ومضيق البوسفور' } },
  { en: 'Dubai, UAE', ar: 'دبي، الإمارات', note: { en: 'Desert, towers and malls', ar: 'صحراء وأبراج ومراكز تسوق' } },
]

const uid = () => Math.random().toString(36).slice(2, 10)
const load = (): Trip[] => { try { return JSON.parse(localStorage.getItem('travel-planner-trips') || '[]') } catch { return [] } }

export default function App() {
  const { lang, setLang, t } = useI18n('travel-planner-lang')
  const [trips, setTrips] = useState<Trip[]>(load)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [tab, setTab] = useState<'itinerary' | 'expenses' | 'packing' | 'notes'>('itinerary')
  const [form, setForm] = useState({ name: '', destination: '', start: '', end: '', budget: '', currency: 'USD' })
  const [formError, setFormError] = useState('')
  const [dayTitle, setDayTitle] = useState('')
  const [activityInputs, setActivityInputs] = useState<Record<string, string>>({})
  const [expForm, setExpForm] = useState({ name: '', amount: '', category: 'food' })
  const [packInput, setPackInput] = useState('')
  const [noteInput, setNoteInput] = useState('')

  useEffect(() => { try { localStorage.setItem('travel-planner-trips', JSON.stringify(trips)) } catch { /* ignore */ } }, [trips])
  const trip = useMemo(() => trips.find((x) => x.id === selectedId) || null, [trips, selectedId])
  const updateTrip = (id: string, fn: (tr: Trip) => Trip) => setTrips((prev) => prev.map((x) => (x.id === id ? fn(x) : x)))

  const createTrip = () => {
    if (!form.name.trim() || !form.destination.trim() || !form.start || !form.end) { setFormError(t('formError')); return }
    if (form.end < form.start) { setFormError(t('formError')); return }
    setFormError('')
    const nt: Trip = { id: uid(), name: form.name.trim(), destination: form.destination.trim(), start: form.start, end: form.end, budget: Number(form.budget) || 0, currency: form.currency, days: [], expenses: [], packing: [], notes: [] }
    setTrips((p) => [...p, nt]); setSelectedId(nt.id); setForm({ name: '', destination: '', start: '', end: '', budget: '', currency: 'USD' })
  }
  const totalSpent = trip ? trip.expenses.reduce((a, e) => a + e.amount, 0) : 0

  return (
    <div className="min-h-screen bg-white text-[#181818]">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:start-2 focus:bg-white focus:px-4 focus:py-2 focus:rounded-lg">Skip to content</a>
      <header className="sticky top-4 z-10 mx-auto max-w-6xl px-4">
        <nav className="flex items-center justify-between gap-4 rounded-2xl border border-[#e3e3e3] bg-white/90 px-4 py-3 shadow-sm backdrop-blur" aria-label="Main">
          <span className="title-1 flex items-center gap-2"><AirplaneTilt size={22} className="text-[#0f766e]" />{t('appName')}</span>
          <button type="button" onClick={() => setLang(lang === 'en' ? 'ar' : 'en')} className="button-sm flex items-center gap-2 rounded-xl border border-[#e3e3e3] px-3 py-2 motion-hover hover:bg-[#f5f5f5] active:scale-[0.98]"><GlobeHemisphereWest size={18} />{lang === 'en' ? t('langAr') : t('langEn')}</button>
        </nav>
      </header>
      <main id="main" className="mx-auto max-w-6xl px-4">
        <section className="py-16 md:py-24">
          <p className="caption-2 text-[#0f766e]">{t('tagline')}</p>
          <h1 className="heading-1 hero-gradient mt-4 max-w-[680px]">{t('heroTitle')}</h1>
          <p className="body-3 mt-4 max-w-[680px] text-[#555555]">{t('heroSub')}</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <button type="button" onClick={() => document.getElementById('planner')?.scrollIntoView({ behavior: 'smooth' })} className="button-md rounded-xl bg-[#0f766e] px-3 py-2 text-white motion-hover hover:bg-[#0d5c56] active:scale-[0.98]">{t('ctaStart')}</button>
            <button type="button" onClick={() => document.getElementById('destinations')?.scrollIntoView({ behavior: 'smooth' })} className="button-md rounded-xl border border-[#e3e3e3] px-3 py-2 motion-hover hover:bg-[#f5f5f5] active:scale-[0.98]">{t('ctaTrips')}</button>
          </div>
          <p className="caption-2 mt-8 rounded-xl bg-[#ccfbf1] p-4 text-[#134e4a]"><MapPin size={16} className="inline me-2" />{t('mapNote')}</p>
        </section>

        <section id="destinations" className="pb-16">
          <h2 className="heading-5">{t('destinations')} · <span className="caption-4 rounded-full bg-[#ccfbf1] px-2 py-1">{t('sample')}</span></h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SAMPLE_DESTINATIONS.map((d) => (
              <article key={d.en} className="rounded-2xl border border-[#e3e3e3] p-4 motion-hover hover:border-[#0f766e]">
                <div className="flex h-24 items-center justify-center rounded-xl bg-[#ccfbf1]"><MapPin size={32} className="text-[#0f766e]" /></div>
                <h3 className="title-2 mt-4">{lang === 'ar' ? d.ar : d.en}</h3>
                <p className="body-6 mt-2 text-[#555555]">{lang === 'ar' ? d.note.ar : d.note.en}</p>
                <button type="button" onClick={() => { setForm((f) => ({ ...f, destination: d.en })); document.getElementById('planner')?.scrollIntoView({ behavior: 'smooth' }) }} className="button-sm mt-4 rounded-xl border border-[#e3e3e3] px-3 py-2 motion-hover hover:bg-[#f5f5f5] active:scale-[0.98]">{t('newTrip')}</button>
              </article>
            ))}
          </div>
        </section>

        <section id="planner" className="pb-16">
          <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
            <div>
              <h2 className="heading-5">{t('trips')}</h2>
              <div className="mt-4 rounded-2xl border border-[#e3e3e3] p-4">
                <h3 className="title-2">{t('newTrip')}</h3>
                <div className="mt-4 space-y-4">
                  <div><label htmlFor="tr-name" className="title-4 block">{t('tripName')}</label><input id="tr-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={t('tripNamePh')} className="mt-2 w-full rounded-xl border border-[#e3e3e3] p-4 body-3" /></div>
                  <div><label htmlFor="tr-dest" className="title-4 block">{t('destination')}</label><input id="tr-dest" value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} placeholder={t('destinationPh')} className="mt-2 w-full rounded-xl border border-[#e3e3e3] p-4 body-3" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label htmlFor="tr-start" className="title-4 block">{t('startDate')}</label><input id="tr-start" type="date" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} className="mt-2 w-full rounded-xl border border-[#e3e3e3] p-4 body-3" /></div>
                    <div><label htmlFor="tr-end" className="title-4 block">{t('endDate')}</label><input id="tr-end" type="date" value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} className="mt-2 w-full rounded-xl border border-[#e3e3e3] p-4 body-3" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label htmlFor="tr-budget" className="title-4 block">{t('budget')}</label><input id="tr-budget" type="number" min="0" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} placeholder={t('budgetPh')} className="mt-2 w-full rounded-xl border border-[#e3e3e3] p-4 body-3" /></div>
                    <div><label htmlFor="tr-cur" className="title-4 block">{t('currency')}</label>
                      <select id="tr-cur" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className="mt-2 w-full rounded-xl border border-[#e3e3e3] p-4 body-3 bg-white">
                        {['USD', 'EUR', 'EGP', 'SAR', 'AED'].map((c) => <option key={c}>{c}</option>)}
                      </select></div>
                  </div>
                </div>
                {formError && <p className="body-6 mt-2 text-red-700" role="alert">{formError}</p>}
                <button type="button" onClick={createTrip} className="button-md mt-4 w-full rounded-xl bg-[#0f766e] px-3 py-2 text-white motion-hover hover:bg-[#0d5c56] active:scale-[0.98]">{t('createTrip')}</button>
              </div>
              <ul className="mt-4 space-y-2">
                {trips.map((tr) => (
                  <li key={tr.id}>
                    <button type="button" onClick={() => setSelectedId(tr.id)} className={`w-full rounded-xl border p-4 text-start motion-hover active:scale-[0.98] ${selectedId === tr.id ? 'border-[#0f766e] bg-[#ccfbf1]' : 'border-[#e3e3e3] hover:bg-[#f5f5f5]'}`}>
                      <span className="title-3 block">{tr.name}</span>
                      <span className="caption-2 mt-1 block text-[#555555]">{tr.destination} · {tr.start} — {tr.end}</span>
                    </button>
                  </li>
                ))}
              </ul>
              {trips.length === 0 && <p className="body-6 mt-4 rounded-xl bg-[#f5f5f5] p-4 text-[#555555]">{t('noTrips')}</p>}
            </div>

            <div>
              {!trip ? (
                <p className="body-3 rounded-2xl border border-dashed border-[#e3e3e3] p-8 text-center text-[#555555]">{t('selectTrip')}</p>
              ) : (
                <div>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 className="heading-5">{trip.name}</h2>
                      <p className="body-6 mt-2 text-[#555555]"><MapPin size={16} className="inline me-1" />{trip.destination} · <CalendarBlank size={16} className="inline me-1" />{trip.start} — {trip.end} · {t('budget')}: {trip.budget} {trip.currency}</p>
                    </div>
                    <button type="button" onClick={() => { if (window.confirm(t('deleteConfirm'))) { setTrips((p) => p.filter((x) => x.id !== trip.id)); setSelectedId(null) } }} className="button-sm flex items-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-red-700 motion-hover hover:bg-red-50 active:scale-[0.98]"><Trash size={16} />{t('deleteTrip')}</button>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-2" role="tablist">
                    {(['itinerary', 'expenses', 'packing', 'notes'] as const).map((tb) => (
                      <button key={tb} type="button" role="tab" aria-selected={tab === tb} onClick={() => setTab(tb)} className={`button-sm rounded-xl px-3 py-2 motion-hover active:scale-[0.98] ${tab === tb ? 'bg-[#181818] text-white' : 'border border-[#e3e3e3] hover:bg-[#f5f5f5]'}`}>{t(tb)}</button>
                    ))}
                  </div>

                  {tab === 'itinerary' && (
                    <div className="mt-6">
                      <div className="flex flex-wrap gap-2">
                        <input value={dayTitle} onChange={(e) => setDayTitle(e.target.value)} placeholder={t('dayTitlePh')} className="min-w-0 flex-1 rounded-xl border border-[#e3e3e3] p-4 body-3" aria-label={t('dayTitle')} />
                        <button type="button" onClick={() => { if (!dayTitle.trim()) return; updateTrip(trip.id, (tr) => ({ ...tr, days: [...tr.days, { id: uid(), title: dayTitle.trim(), activities: [] }] })); setDayTitle('') }} className="button-md flex items-center gap-2 rounded-xl bg-[#0f766e] px-3 py-2 text-white motion-hover hover:bg-[#0d5c56] active:scale-[0.98]"><Plus size={18} />{t('addDay')}</button>
                      </div>
                      {trip.days.length === 0 ? <p className="body-6 mt-6 rounded-xl bg-[#f5f5f5] p-4 text-[#555555]">{t('dayEmpty')}</p> : (
                        <ol className="mt-6 space-y-4">
                          {trip.days.map((day, i) => (
                            <li key={day.id} className="rounded-2xl border border-[#e3e3e3] p-4">
                              <div className="flex items-center justify-between gap-4">
                                <h3 className="title-2">{i + 1} · {day.title}</h3>
                                <button type="button" onClick={() => updateTrip(trip.id, (tr) => ({ ...tr, days: tr.days.filter((d) => d.id !== day.id) }))} className="button-sm flex items-center gap-1 rounded-xl border border-[#e3e3e3] px-3 py-2 text-red-700 motion-hover hover:bg-red-50 active:scale-[0.98]"><X size={16} />{t('remove')}</button>
                              </div>
                              <ul className="mt-4 space-y-2">
                                {day.activities.map((a, ai) => (
                                  <li key={ai} className="flex items-center justify-between gap-4 rounded-xl bg-[#f5f5f5] p-4"><span className="body-3">{a}</span>
                                    <button type="button" onClick={() => updateTrip(trip.id, (tr) => ({ ...tr, days: tr.days.map((d) => d.id === day.id ? { ...d, activities: d.activities.filter((_, j) => j !== ai) } : d) }))} className="button-sm text-red-700" aria-label={t('remove')}><X size={16} /></button></li>
                                ))}
                              </ul>
                              <div className="mt-4 flex gap-2">
                                <input value={activityInputs[day.id] || ''} onChange={(e) => setActivityInputs({ ...activityInputs, [day.id]: e.target.value })} placeholder={t('activityPh')} className="min-w-0 flex-1 rounded-xl border border-[#e3e3e3] p-4 body-3" aria-label={t('activities')} />
                                <button type="button" onClick={() => { const v = (activityInputs[day.id] || '').trim(); if (!v) return; updateTrip(trip.id, (tr) => ({ ...tr, days: tr.days.map((d) => d.id === day.id ? { ...d, activities: [...d.activities, v] } : d) })); setActivityInputs({ ...activityInputs, [day.id]: '' }) }} className="button-md rounded-xl border border-[#e3e3e3] px-3 py-2 motion-hover hover:bg-[#f5f5f5] active:scale-[0.98]">{t('addActivity')}</button>
                              </div>
                            </li>
                          ))}
                        </ol>
                      )}
                    </div>
                  )}

                  {tab === 'expenses' && (
                    <div className="mt-6">
                      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                        <div className="rounded-xl bg-[#f5f5f5] p-4"><p className="caption-4 text-[#555555]">{t('totalSpent')}</p><p className="heading-6 mt-2"><Money size={20} className="inline me-1" />{totalSpent} {trip.currency}</p></div>
                        <div className="rounded-xl bg-[#f5f5f5] p-4"><p className="caption-4 text-[#555555]">{t('remaining')}</p><p className="heading-6 mt-2">{Math.max(0, trip.budget - totalSpent)} {trip.currency}</p></div>
                      </div>
                      <div className="mt-6 grid gap-4 md:grid-cols-[1fr_160px_160px_auto]">
                        <input value={expForm.name} onChange={(e) => setExpForm({ ...expForm, name: e.target.value })} placeholder={t('expenseNamePh')} className="rounded-xl border border-[#e3e3e3] p-4 body-3" aria-label={t('expenseName')} />
                        <input type="number" min="0" value={expForm.amount} onChange={(e) => setExpForm({ ...expForm, amount: e.target.value })} placeholder={t('expenseAmount')} className="rounded-xl border border-[#e3e3e3] p-4 body-3" aria-label={t('expenseAmount')} />
                        <select value={expForm.category} onChange={(e) => setExpForm({ ...expForm, category: e.target.value })} className="rounded-xl border border-[#e3e3e3] p-4 body-3 bg-white" aria-label={t('expenseCategory')}>
                          {['stay', 'food', 'transport', 'tickets', 'other'].map((c) => <option key={c} value={c}>{t(`cat${c.charAt(0).toUpperCase() + c.slice(1)}`)}</option>)}
                        </select>
                        <button type="button" onClick={() => { if (!expForm.name.trim() || !expForm.amount) return; updateTrip(trip.id, (tr) => ({ ...tr, expenses: [...tr.expenses, { id: uid(), name: expForm.name.trim(), amount: Number(expForm.amount), category: expForm.category }] })); setExpForm({ name: '', amount: '', category: 'food' }) }} className="button-md rounded-xl bg-[#0f766e] px-3 py-2 text-white motion-hover hover:bg-[#0d5c56] active:scale-[0.98]">{t('addExpense')}</button>
                      </div>
                      {trip.expenses.length === 0 ? <p className="body-6 mt-6 rounded-xl bg-[#f5f5f5] p-4 text-[#555555]">{t('noExpenses')}</p> : (
                        <ul className="mt-6 space-y-2">{trip.expenses.map((e) => (
                          <li key={e.id} className="flex items-center justify-between gap-4 rounded-xl border border-[#e3e3e3] p-4">
                            <span className="body-3">{e.name} · <span className="caption-4 text-[#555555]">{t(`cat${e.category.charAt(0).toUpperCase() + e.category.slice(1)}`)}</span></span>
                            <span className="flex items-center gap-4"><span className="body-5">{e.amount} {trip.currency}</span>
                              <button type="button" onClick={() => updateTrip(trip.id, (tr) => ({ ...tr, expenses: tr.expenses.filter((x) => x.id !== e.id) }))} className="text-red-700" aria-label={t('remove')}><X size={16} /></button></span>
                          </li>))}</ul>
                      )}
                    </div>
                  )}

                  {tab === 'packing' && (
                    <div className="mt-6">
                      <div className="flex gap-2">
                        <input value={packInput} onChange={(e) => setPackInput(e.target.value)} placeholder={t('packItemPh')} className="min-w-0 flex-1 rounded-xl border border-[#e3e3e3] p-4 body-3" aria-label={t('packItem')} />
                        <button type="button" onClick={() => { if (!packInput.trim()) return; updateTrip(trip.id, (tr) => ({ ...tr, packing: [...tr.packing, { id: uid(), label: packInput.trim(), done: false }] })); setPackInput('') }} className="button-md flex items-center gap-2 rounded-xl bg-[#0f766e] px-3 py-2 text-white motion-hover hover:bg-[#0d5c56] active:scale-[0.98]"><Backpack size={18} />{t('addItem')}</button>
                      </div>
                      <p className="caption-2 mt-4 text-[#555555]">{trip.packing.filter((p) => p.done).length}/{trip.packing.length} · {t('packed')}</p>
                      {trip.packing.length === 0 ? <p className="body-6 mt-4 rounded-xl bg-[#f5f5f5] p-4 text-[#555555]">{t('noPack')}</p> : (
                        <ul className="mt-4 space-y-2">{trip.packing.map((p) => (
                          <li key={p.id}>
                            <label className="flex cursor-pointer items-center gap-4 rounded-xl border border-[#e3e3e3] p-4 motion-hover hover:bg-[#f5f5f5]">
                              <input type="checkbox" checked={p.done} onChange={() => updateTrip(trip.id, (tr) => ({ ...tr, packing: tr.packing.map((x) => x.id === p.id ? { ...x, done: !x.done } : x) }))} className="h-5 w-5 accent-[#0f766e]" />
                              <span className={`body-3 ${p.done ? 'line-through text-[#555555]' : ''}`}>{p.label}</span>
                              <button type="button" onClick={(e) => { e.preventDefault(); updateTrip(trip.id, (tr) => ({ ...tr, packing: tr.packing.filter((x) => x.id !== p.id) })) }} className="ms-auto text-red-700" aria-label={t('remove')}><X size={16} /></button>
                            </label>
                          </li>))}</ul>
                      )}
                    </div>
                  )}

                  {tab === 'notes' && (
                    <div className="mt-6">
                      <div className="flex gap-2">
                        <input value={noteInput} onChange={(e) => setNoteInput(e.target.value)} placeholder={t('notePh')} className="min-w-0 flex-1 rounded-xl border border-[#e3e3e3] p-4 body-3" aria-label={t('noteText')} />
                        <button type="button" onClick={() => { if (!noteInput.trim()) return; updateTrip(trip.id, (tr) => ({ ...tr, notes: [...tr.notes, { id: uid(), text: noteInput.trim() }] })); setNoteInput('') }} className="button-md flex items-center gap-2 rounded-xl bg-[#0f766e] px-3 py-2 text-white motion-hover hover:bg-[#0d5c56] active:scale-[0.98]"><NotePencil size={18} />{t('addNote')}</button>
                      </div>
                      {trip.notes.length === 0 ? <p className="body-6 mt-6 rounded-xl bg-[#f5f5f5] p-4 text-[#555555]">{t('noNotes')}</p> : (
                        <ul className="mt-6 space-y-2">{trip.notes.map((n) => (
                          <li key={n.id} className="flex items-start justify-between gap-4 rounded-xl border border-[#e3e3e3] p-4"><span className="body-3">{n.text}</span>
                            <button type="button" onClick={() => updateTrip(trip.id, (tr) => ({ ...tr, notes: tr.notes.filter((x) => x.id !== n.id) }))} className="text-red-700" aria-label={t('remove')}><X size={16} /></button></li>))}</ul>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t border-[#e3e3e3] py-8">
        <p className="caption-2 mx-auto max-w-6xl px-4 text-[#555555]">{t('footerNote')}</p>
      </footer>
    </div>
  )
}
