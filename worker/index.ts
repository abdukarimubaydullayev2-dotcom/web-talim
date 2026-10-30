import adminHTML from '../admin/index.html?raw';
import adminJS from '../admin/client.js?raw';
import adminCSS from '../admin/style.css?raw';
import teacherHTML from '../teacher/index.html?raw';
import teacherJS from '../teacher/client.js?raw';
import teacherCSS from '../teacher/style.css?raw';
import examHTML from '../exams/student.html?raw';
import examJS from '../exams/student.js?raw';
import resourcesHTML from '../resources/index.html?raw';
import resourcesJS from '../resources/client.js?raw';
import adminResourcesHTML from '../admin/resources.html?raw';
import adminResourcesJS from '../admin/resources-client.js?raw';
import { gateway } from '../auth/gateway.mjs';
import loginHTML from '../auth/login.html?raw';
import accountHTML from '../auth/account.html?raw';
import courseHTML from '../course/index.html?raw';
import clientJS from '../auth/client.js?raw';
import styleCSS from '../auth/style.css?raw';
import handler from "vinext/server/fetch-handler";
import { runWithConnectorBinding } from "../lib/connector-context";
import type { ConnectorBinding } from "../lib/connector-contract.mjs";

const worker = {
  fetch(request: Request, env: Cloudflare.Env, ctx: ExecutionContext<{ CONNECTORS?: ConnectorBinding }>) {
    let binding = ctx.props?.CONNECTORS;
    // Local preview emulates the same request-scoped capability. This branch and
    // the auxiliary service binding are absent from production builds.
    if (import.meta.env.DEV && !binding && env.CONNECTORS) {
      const preview = env.CONNECTORS;
      const expiresAt = Date.now() + 60_000;
      binding = {
        async getContext() {
          if (Date.now() >= expiresAt) return { status: "request_context_expired" };
          return preview.getContext?.() ?? { status: "binding_unavailable" };
        },
        async invoke(connectorId, actionName, args) {
          if (Date.now() >= expiresAt) {
            return { status: "request_context_expired", message: "This request has expired. Please try again." };
          }
          return preview.invoke(connectorId, actionName, args);
        },
      };
    }
    return runWithConnectorBinding(binding, () => gateway(request, env, {loginHTML,accountHTML,courseHTML,clientJS,styleCSS,adminHTML,adminJS,adminCSS,teacherHTML,teacherJS,teacherCSS,examHTML,examJS,resourcesHTML,resourcesJS,adminResourcesHTML,adminResourcesJS}));
  },
};

export default worker;
