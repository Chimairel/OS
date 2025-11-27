"use client";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const portfolioItems = [
    {
      id: 1,
      title: "FCFS Scheduler Simulator",
      description:
        "A simulator for the First-Come, First-Served (FCFS) CPU scheduling algorithm, visualizing process execution, context switching, and wait times.",
      link: "/projects/fcfs",
      image: "/FCFS.png",
      openInNewTab: true,
    },
    {
      id: 2,
      title: "7 EVELYN",
      description:
        "A simple e-commerce site mock-up focused on a modern shopping experience. This application features product browsing, search, filtering, a shopping cart, and a secure checkout process.",
      link: "https://7-evelyn-gilt.vercel.app/",
      image: "/7-evelyn.png",
      openInNewTab: true,
    },
  ];

  return (
    <main className="min-h-screen bg-gray-100 font-mono text-gray-900 border-4 border-black p-4 md:p-8">
      <style jsx global>{`
        .retro-button {
          @apply px-4 py-2 font-bold text-center border-2 border-black bg-white shadow-[4px_4px_0px_rgba(0,0,0,1)] transition duration-150 hover:bg-gray-200 active:shadow-none active:translate-x-1 active:translate-y-1;
        }
        .retro-link-button {
          @apply retro-button block text-lg;
        }
      `}</style>

      {/* Top Bar / Navigation */}
      <nav className="flex items-center justify-between border-b-2 border-black pb-4 mb-8">
        <div className="flex items-center space-x-2">
          <span className="w-4 h-4 bg-black rounded-full block"></span>
          <span className="font-bold text-xl">Chimairel.app</span>
        </div>
        <div className="hidden md:flex space-x-6">
          <Link href="#about" className="font-semibold hover:underline">
            About
          </Link>
          <Link href="#portfolio" className="font-semibold hover:underline">
            Portfolio
          </Link>
          <Link href="#contact" className="font-semibold hover:underline">
            Contact
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="border-2 border-black bg-white p-6 mb-8 shadow-md">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-6 md:mb-0 md:w-2/3">
            <h1 className="text-6xl font-extrabold leading-tight mb-4">
              Hello. <br /> I'm Chimairel Pacaldo.
            </h1>
            <p className="text-xl mb-6">
              I'm a passionate web developer focused on building modern,
              interactive, and efficient web applications.
            </p>
            <div className="flex space-x-4">
              <Link href="#portfolio" className="retro-button">
                View My Work
              </Link>
              <a href="/resume.pdf" download className="retro-button">
                Download Resume
              </a>
            </div>
          </div>

          <div className="md:w-1/3 flex justify-center items-center">
            <Image
              src="/pixelart.png"
              alt="Pixel art laptop"
              width={300}
              height={300}
              className="w-full h-auto max-w-sm"
              priority
            />
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Quick links</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Link href="#about" className="retro-link-button">
            About
          </Link>
          <Link href="#portfolio" className="retro-link-button">
            Portfolio
          </Link>
          <Link href="#contact" className="retro-link-button">
            Contact
          </Link>
        </div>
      </section>

      {/* ABOUT ME Section */}
      <section
        id="about"
        className="mb-8 p-4 border-2 border-black bg-white shadow-md"
      >
        <div className="flex items-center border-b-2 border-black pb-3 mb-6">
          <span className="w-3 h-3 bg-black rounded-full mr-2"></span>
          <span className="w-3 h-3 bg-black rounded-full mr-2"></span>
          <h2 className="text-2xl font-bold">About Me</h2>
        </div>
        <p className="text-gray-700 leading-relaxed mb-4">
          Hi! I'm Chimairel Pacaldo, a passionate web developer focused on
          building modern, interactive, and efficient web applications using
          Next.js, React, and Tailwind CSS. I love learning new technologies and
          implementing projects to solve real-world problems.
        </p>
      </section>

      {/* Portfolio Section */}
      <section
        id="portfolio"
        className="mb-8 p-4 border-2 border-black bg-white shadow-md"
      >
        <div className="flex items-center border-b-2 border-black pb-3 mb-6">
          <span className="w-3 h-3 bg-black rounded-full mr-2"></span>
          <span className="w-3 h-3 bg-black rounded-full mr-2"></span>
          <h2 className="text-2xl font-bold">Portfolio</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {portfolioItems.map((project) => (
            <div
              key={project.id}
              className="border-2 border-black bg-gray-50 shadow-md"
            >
              <div className="flex items-center border-b-2 border-black px-4 py-2 bg-gray-200">
                <span className="w-2 h-2 bg-black rounded-full mr-2"></span>
                <span className="w-2 h-2 bg-black rounded-full mr-2"></span>
                <span className="text-sm">
                  {project.title.replace(/\s/g, "-")}.exe
                </span>
              </div>

              <Image
                src={project.image}
                alt={project.title}
                width={800}
                height={600}
                className="w-full h-48 object-cover border-b-2 border-black"
              />

              <div className="p-4">
                <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                <p className="text-sm text-gray-700 mb-4">
                  {project.description}
                </p>
                <Link
                  href={project.link}
                  className="retro-button text-sm"
                  target={project.openInNewTab ? "_blank" : "_self"}
                  rel={project.openInNewTab ? "noopener noreferrer" : ""}
                >
                  View Project
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section
        id="contact"
        className="p-4 border-2 border-black bg-white shadow-md"
      >
        <div className="flex items-center border-b-2 border-black pb-3 mb-6">
          <span className="w-3 h-3 bg-black rounded-full mr-2"></span>
          <span className="w-3 h-3 bg-black rounded-full mr-2"></span>
          <h2 className="text-2xl font-bold">Contact Me</h2>
        </div>
        <p className="text-lg text-gray-700 mb-6">
          Feel free to reach out for collaborations or just to say hello!
        </p>

        <ol>
          <li>Email: chimairelp@gmail.com</li>
          <li>Phone: 0912-345-6789</li>
        </ol>

        <a
          href="https://gmail.com"
          className="retro-button text-lg mt-4 inline-block"
          target="_blank"
        >
          Send Email
        </a>

        <div className="mt-6 flex space-x-6 text-xl justify-center">
          <a
            href="https://github.com/chimairel"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-700 hover:text-black hover:underline"
          >
            GitHub
          </a>
          <a
            href="https://www.facebook.com/chimairel.pacaldo"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-700 hover:text-black hover:underline"
          >
            Facebook
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-2 border-black pt-4 mt-8 text-center text-sm text-gray-700">
        <p>
          &copy; {new Date().getFullYear()} Chimairel Pacaldo. All rights
          reserved.
        </p>
        <p>Inspired by classic Mac OS aesthetics.</p>
      </footer>
    </main>
  );
}
