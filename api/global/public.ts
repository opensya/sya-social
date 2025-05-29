import { SetMetadata } from "@nestjs/common";

export const Public = () => SetMetadata("IS_PUBLIC", true);

export const DontNeedSession = () => SetMetadata("DONT_NEED_SESSION", true);
