import Echo from "laravel-echo";
import Pusher from "pusher-js";
import {pusherKey, wsHost} from "@/lib/utils/constants/echo";
import {apiUrl} from "@/lib/utils/constants/url";
import Cookies from "js-cookie";

export const echo = new Echo({
  broadcaster: "pusher",
  client: new Pusher(pusherKey!, {
    cluster: "",
    wsHost: wsHost!,
    wsPort: 443,
    wssPort: 443,
    forceTLS: true,
    authEndpoint: `${apiUrl}/broadcasting/auth`,
    auth: { headers: { Authorization: `Bearer ${Cookies.get("access_token")}` } },
    enabledTransports: ["ws", "wss"],
  }),
});
