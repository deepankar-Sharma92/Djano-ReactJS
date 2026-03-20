export default function StatCard({ title, value, color }) {
  return (
    <div className="bg-[#0f172a] p-5 rounded-xl border border-gray-800 shadow-md">

      <div className="flex justify-between items-center mb-4">
        <div className={`w-10 h-10 rounded-lg ${color}`} />
        <span className="text-green-400 text-xs">+4%</span>
      </div>

      <h2 className="text-2xl font-bold text-white">{value}</h2>
      <p className="text-gray-400 text-sm">{title}</p>

    </div>
  );
}