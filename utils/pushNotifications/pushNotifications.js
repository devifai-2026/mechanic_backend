import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export const sendLoginNotification = async (
  empName,
  deviceName,
  playerId,
  content,
  screenName = "Dashboard" // default screen
) => {
  try {
    await axios.post(
      "https://onesignal.com/api/v1/notifications",
      {
        app_id: process.env.ONESIGNAL_APP_ID,
        include_player_ids: [playerId],
        headings: { en: "New Notification" },
        contents: { en: content || `${empName}, you have a new notification` },
        data: {
          screen: screenName,
        },
      },
      {
        headers: {
          Authorization: `Basic ${process.env.ONESIGNAL_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    console.error(
      "Push notification error:",
      err.response?.data || err.message
    );
  }
};
