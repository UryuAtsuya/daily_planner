"use client"

import Image from "next/image"
import { signIn, signOut, useSession } from "next-auth/react"
import { LogIn, LogOut, Loader2 } from "lucide-react"

export function GoogleLoginButton() {
    const { data: session, status } = useSession()

    if (status === "loading") {
        return (
            <button
                disabled
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-400 bg-zinc-100 dark:bg-zinc-800 rounded-lg"
            >
                <Loader2 size={16} className="animate-spin" />
                読み込み中...
            </button>
        )
    }

    if (session) {
        return (
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                    {session.user?.image && (
                        <Image
                            src={session.user.image}
                            alt={session.user.name || "User"}
                            width={28}
                            height={28}
                            className="w-7 h-7 rounded-full"
                        />
                    )}
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                        {session.user?.name || session.user?.email}
                    </span>
                </div>
                <button
                    onClick={() => signOut()}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition"
                >
                    <LogOut size={16} />
                    ログアウト
                </button>
            </div>
        )
    }

    return (
        <button
            onClick={() => signIn("google")}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#4285f4] hover:bg-[#3367d6] rounded-lg shadow-sm transition"
        >
            <LogIn size={16} />
            Googleでログイン
        </button>
    )
}
