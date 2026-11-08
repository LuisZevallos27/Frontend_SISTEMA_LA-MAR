export default function Logo({ grande = false }) {
  return (
    <div className="flex flex-col items-center leading-none text-white">
      <span className={(grande ? 'text-7xl' : 'text-2xl') + ' font-light tracking-tight'}>
        la
        <br />
        Mar
      </span>
      <span className={(grande ? 'mt-2 text-lg' : 'text-[10px]') + ' text-slate-300'}>para empleados</span>
    </div>
  )
}