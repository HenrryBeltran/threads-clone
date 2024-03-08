"use server";

import { xata } from "@/db";
import { Try } from "@/lib/safeTry";
import { RegisterFormData } from "./RegisterForm";

interface FormData extends RegisterFormData {
  profilePicture?: {
    name: string;
    base64: string;
  };
}

export async function registerUser(data: FormData) {
  const username = data.username.toLowerCase();

  const { error: repeatUserError, result: foundRepeatUser } = await Try(
    xata.db.user.select(["id", "username"]).filter({ username }).getFirst(),
  );

  if (repeatUserError) {
    throw Error(repeatUserError.message);
  }

  if (foundRepeatUser) {
    return { errors: { username: "This username already exists." } };
  }

  console.log("~ Completed user registration", JSON.stringify(data, null, 2));

  // const { getUser } = getKindeServerSession();
  // const user = await getUser();
  //
  // if (user) {
  //   console.log(JSON.stringify({ ...data, ...user }, null, 2));
  //
  //   let insertUser;
  //   if (data.profilePicture) {
  //     insertUser = xata.db.user.create({
  //       username,
  //       bio: data.bio,
  //       auth_id: user.id,
  //       email: user.email,
  //       name: user.given_name,
  //       lastname: user.family_name,
  //       profile_picture: {
  //         name: data.profilePicture.name,
  //         mediaType: "image/jpg",
  //         base64Content: data.profilePicture.base64.split(";base64,")[1],
  //         enablePublicUrl: true,
  //       },
  //     });
  //   } else {
  //     insertUser = xata.db.user.create({
  //       username,
  //       bio: data.bio,
  //       auth_id: user.id,
  //       email: user.email,
  //       name: user.given_name,
  //       lastname: user.family_name,
  //     });
  //   }
  //
  //   const { error } = await Try(insertUser);
  //
  //   if (error) {
  //     console.error(JSON.stringify(error));
  //     return { errors: { root: "Something went wrong." } };
  //   }
  //
  //   redirect("/");
  // }
}
