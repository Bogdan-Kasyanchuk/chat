/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as access from "../access.js";
import type * as auth from "../auth.js";
import type * as authRules from "../authRules.js";
import type * as cascade from "../cascade.js";
import type * as chatRules from "../chatRules.js";
import type * as chats from "../chats.js";
import type * as contacts from "../contacts.js";
import type * as emailPassword from "../emailPassword.js";
import type * as http from "../http.js";
import type * as messages from "../messages.js";
import type * as presence from "../presence.js";
import type * as testing from "../testing.js";
import type * as users from "../users.js";
import type * as validators from "../validators.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  access: typeof access;
  auth: typeof auth;
  authRules: typeof authRules;
  cascade: typeof cascade;
  chatRules: typeof chatRules;
  chats: typeof chats;
  contacts: typeof contacts;
  emailPassword: typeof emailPassword;
  http: typeof http;
  messages: typeof messages;
  presence: typeof presence;
  testing: typeof testing;
  users: typeof users;
  validators: typeof validators;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
