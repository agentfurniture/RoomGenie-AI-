export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-6">
      <h1 className="text-5xl font-bold mb-4">RoomGenie AI</h1>
      <p className="text-gray-400 text-xl mb-8">AI Interior Design Platform — Coming Soon</p>
      <a
        href="/create"
        className="bg-white text-black px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
      >
        Start Designing
      </a>
    </main>
  )
}
