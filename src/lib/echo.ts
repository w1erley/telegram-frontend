import Echo from "laravel-echo";
import Pusher from "pusher-js";
import {reverbKey, reverbScheme, wsHost} from "@/lib/utils/constants/echo";
import {apiUrl} from "@/lib/utils/constants/url";
import Cookies from "js-cookie";

export const echo = new Echo({
  broadcaster: "reverb",
  client: new Pusher(reverbKey!, {
    cluster: "",
    wsHost: wsHost!,
    wsPort: 6001,
    wssPort: 6001,
    forceTLS: (reverbScheme ?? 'https') === 'https',
    authEndpoint: `${apiUrl}/broadcasting/auth`,
    auth: { headers: { Authorization: `Bearer ${Cookies.get("access_token")}` } },
    enabledTransports: ["ws", "wss"],
  }),
});