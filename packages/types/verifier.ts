export enum VerifyStatus {
  NotVerified = 'NotVerified',
  Verifying = 'Verifying',
  Verified = 'Verified',
}

export interface VerifierItem {
  id: string; // aelf.Hash
  name: string;
  imageUrl: string;
  endPoints: string[];
  verifierAddresses: string[];
}

// 0: register, 1: community recovery, 2: Add Guardian 3: Set LoginAccount 4: addManager
export enum VerificationType {
  register,
  communityRecovery,
  addGuardian,
  setLoginAccount,
  addManager,
  editGuardian,
  removeOtherManager,
  addGuardianByApprove,
  deleteGuardian,
}

export enum ApprovalType {
  communityRecovery,
  addGuardian,
  deleteGuardian,
  editGuardian,
  removeOtherManager,
}

// Indicates the type of operation to generate a signature file
export enum OperationTypeEnum {
  unknown = 0,
  register = 1,
  communityRecovery = 2,
  addGuardian = 3,
  deleteGuardian = 4,
  editGuardian = 5,
  removeOtherManager = 6,
  setLoginAccount = 7,
}

export interface VerifierInfo {
  verifierId: string;
  verificationDoc: string;
  signature: string;
}

export interface AuthenticationInfo {
  [userId: string]: string;
}
