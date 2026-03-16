import Image from "next/image";

export default function Home() {
  return (
   <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0B1320] to-[#1C2541]">
      <div className="text-center p-6 bg-[#112D4E] rounded-lg shadow-lg">
        <Image
          src="/logo/1.jpg"
          alt="Feast.id Logo"
          width={100}
          height={100}
          className="mx-auto mb-4 rounded-full border-4 border-white"
        />
        <h1 className="text-4xl font-bold text-white mb-2">Welcome to Feast.id</h1>
        <p className="text-gray-300 text-lg mb-6">
          Your one-stop solution for professional shoe cleaning services.
        </p>
        <a
          href="/gallery"
          className="inline-block px-6 py-3 bg-[#3A506B] text-white font-semibold rounded-full hover:bg-[#5BC0BE] transition-colors duration-300"
        >
          Explore Our Gallery
        </a>
      </div>
    </div>  
  );
}
