import { useEffect, useState } from "react";
import { supabase } from "../../services/supabase.js";
import defaultAvatar from "../../assets/default_icon.png";
import { Input, Avatar, Button } from "@material-tailwind/react";

export default function profilePicture({ size, onUpload, session }) {
  const [profilePicture, setProfilePicture] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function fetchUserProfile() {
      const { user } = session;

      let { data, error } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", user.id)
        .single();

      if (error) {
        console.warn(error);
      } else if (data) {
        setProfilePicture(data.avatar_url);
      }
    }

    fetchUserProfile();
  }, [session]);

  async function uploadProfilePicture(event) {
    const { user } = session;
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("You must select an image to upload.");
      }

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload the image file to Supabase storage
      let { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const completeUrl = `https://ycfcamxsouvagmrltkbj.supabase.co/storage/v1/object/public/avatars/${filePath}`;

      // Update the avatar_url in the profiles table with the new uploaded image path
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: completeUrl })
        .eq("id", user.id);

      if (updateError) {
        throw updateError;
      }

      // Call the onUpload callback with the event and the new file path
      onUpload(completeUrl);
    } catch (error) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label htmlFor="profilePictureInput">
        <Avatar
          variant="rounded"
          size="xxl"
          className="border border-orange-500 p-0.5"
          src={profilePicture || defaultAvatar}
          alt="Your Avatar"
        />
        <input
          type="file"
          accept="image/*"
          onChange={uploadProfilePicture}
          style={{ display: "none" }}
          id="profilePictureInput"
        />
      </label>
      <div className="mt-4">
        <Button
          color="light-blue"
          size="md"
          variant="gradient"
          disabled={uploading}
          onClick={() => {
            // Trigger the file input when the button is clicked
            document.getElementById("profilePictureInput").click();
          }}
        >
          {uploading ? "Uploading ..." : "Upload Profile Picture"}
        </Button>
      </div>
    </div>
  );
}
