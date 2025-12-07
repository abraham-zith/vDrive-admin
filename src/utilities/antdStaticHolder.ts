import { App } from "antd";
import type { MessageInstance } from "antd/es/message/interface";
import type { NotificationInstance } from "antd/es/notification/interface";
import type { ModalStaticFunctions } from "antd/es/modal/confirm";

let messageApi: MessageInstance;
let notificationApi: NotificationInstance;
let modalApi: ModalStaticFunctions;

export const AntdStaticHolder = () => {
  const staticFunction = App.useApp();
  messageApi = staticFunction.message;
  notificationApi = staticFunction.notification;
  modalApi = staticFunction.modal as unknown as ModalStaticFunctions;
  return null;
};

export { messageApi, notificationApi, modalApi };
