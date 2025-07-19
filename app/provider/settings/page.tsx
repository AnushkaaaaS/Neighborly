import { Button } from "@/components/ui/button";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth?client_id=YOUR_CLIENT_ID&redirect_uri=YOUR_REDIRECT_URI&response_type=code&scope=https://www.googleapis.com/auth/calendar&access_type=offline&prompt=consent";

<Button
  onClick={() => window.location.href = GOOGLE_AUTH_URL}
  className="mt-4"
>
  Connect Google Calendar
</Button>
