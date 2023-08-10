"use client"

import { Session, createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

export default function AuthButtonClient<Database>({ session }: {session : Session | null} ){

    const supabase = createClientComponentClient<Database>();

    const router = useRouter();

    const handleSignIn = async () => {
        console.log('Clicked Log In Auth Button!');
        await supabase.auth.signInWithOAuth({
            provider:  'github',
            options: {
                redirectTo: `${location.origin}/auth/callback`,
            }
        });
      };

      const handleSignOut = async () => {
        console.log('Clicked Log Out!');
        await supabase.auth.signOut();
        router.refresh();
      };

      return session ? (
          <button className="text-xs text-gray-400" onClick={handleSignOut}>Logout</button>
        
        ) : (
          <button className="text-xs text-gray-400" onClick={handleSignIn}>Login</button>
        );
}