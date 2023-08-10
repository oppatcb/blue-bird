'use client'

import { createClient } from "@supabase/supabase-js";
import Likes from "./likes";
import { useEffect, experimental_useOptimistic as useOptimistic } from 'react'
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { userAgentFromString } from "next/server";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Tweets({ tweets }: {tweets: TweetWithAuthor[]}) {

    const [optimisticTweets, addOptimistictTweet] =
      useOptimistic<TweetWithAuthor[], TweetWithAuthor>
      ( tweets,
        (currentOptimisticTweets, newTweet) => {
          const newOptimisticTweets = [...currentOptimisticTweets];
          const index = newOptimisticTweets.findIndex(
            tweet => tweet.id === newTweet.id
          );
          newOptimisticTweets[index] = newTweet;
          return newOptimisticTweets;
        });

    const supabase = createClientComponentClient<Database>();
    const router = useRouter();

    useEffect(
        () => {
            const channel = supabase.channel('realtime tweets').on('postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'tweets',
            },
            (payload) => {
                console.log(payload);
                router.refresh();
            }).subscribe();

            const channelLikes = supabase.channel('realtime likes').on('postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'likes',
            },
            (payload) => {
                console.log(payload);
                router.refresh();
            }).subscribe();

            return () => {
                supabase.removeChannel(channel);
                supabase.removeChannel(channelLikes);
            }

        }, [supabase, router]
    );
    
    console.log(optimisticTweets);
    const remove = (param: String | null) => {
      if(param){
        return param.substring(1,param.length-1);
      }
      return "";
    }

    return optimisticTweets.map( (tweet) => (
      <div key={tweet.id} className="border border-gray-800 border-t-0 px-4 py-8 flex">
        <div className="h-12 w-12">
            <Image className="rounded-full" src={remove(tweet.author.avatar_url)}
            alt="tweet user avatar" width={48} height={48} />
        </div>
        <div className="ml-4">
          <p>
            <span className="font-bold">{remove(tweet.author.name)}</span>
            <span className="text-sm ml-2 text-gray-400">{remove(tweet.author.username)}</span>
          </p>
          <p>
            {tweet.title}
          </p>
          <Likes tweet={tweet} addOptimistictTweet={ addOptimistictTweet }/>
        </div>
      </div>
    ))
  }