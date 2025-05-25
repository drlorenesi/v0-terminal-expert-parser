import { Github } from "lucide-react"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="w-full py-6 mt-8 border-t border-zinc-200 dark:border-zinc-800">
      <div className="container flex flex-col items-center justify-center gap-4 md:flex-row md:justify-between">
        <div className="text-center md:text-left">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Licensed under the MIT License © {new Date().getFullYear()}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="https://github.com/drlorenesi/v0-terminal-expert-parser"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors"
          >
            <Github className="h-4 w-4" />
            <span>GitHub Repository</span>
          </Link>
        </div>
      </div>
    </footer>
  )
}
