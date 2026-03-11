import { Chat } from "@/modules/chat";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="container mx-auto py-10 flex flex-col items-center">
        <div className="w-full max-w-2xl mb-8 flex flex-col items-center text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-2 text-zinc-900 dark:text-zinc-50">
            Intelligent Chat
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Powered by Next.js and Shadcn-UI for a seamless experience.
          </p>
        </div>

        <div className="w-full max-w-2xl">
          <Chat />
        </div>
      </div>
    </main>
  );
}
