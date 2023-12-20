import { UserGuardianItem } from '@portkey-wallet/store/store-ca/guardians/type';
import { VerifierInfo } from '@portkey-wallet/types/verifier';
import { GuardiansApproved, GuardiansStatus } from 'pages/Guardian/types';
import { ContractBasic } from '@portkey-wallet/contracts/utils/ContractBasic';
import { handleVerificationDoc } from '@portkey-wallet/utils/guardian';
import { ITransferLimitItem } from '@portkey-wallet/types/types-ca/paymentSecurity';
import { SendOptions } from '@portkey-wallet/contracts/types';

const getGuardiansApproved = (userGuardiansList: UserGuardianItem[], guardiansStatus: GuardiansStatus) => {
  return userGuardiansList
    .map(guardian => {
      if (!guardiansStatus[guardian.key] || !guardiansStatus[guardian.key].verifierInfo) return null;
      const verificationDoc = guardiansStatus[guardian.key].verifierInfo?.verificationDoc || '';
      const { guardianIdentifier } = handleVerificationDoc(verificationDoc);
      return {
        identifierHash: guardianIdentifier,
        type: guardian.guardianType,
        verificationInfo: {
          id: guardian.verifier?.id,
          signature: Object.values(Buffer.from(guardiansStatus[guardian.key].verifierInfo?.signature as any, 'hex')),
          verificationDoc,
        },
      };
    })
    .filter(item => item !== null);
};

export const getGuardiansApprovedByApprove = (guardiansApprove: GuardiansApproved) => {
  return guardiansApprove.map(item => {
    const { guardianIdentifier } = handleVerificationDoc(item.verificationDoc);
    return {
      identifierHash: guardianIdentifier,
      type: item.guardianType,
      verificationInfo: {
        id: item.verifierId,
        signature: Object.values(Buffer.from(item.signature, 'hex')),
        verificationDoc: item.verificationDoc,
      },
    };
  });
};

export function deleteGuardian(
  contract: ContractBasic,
  address: string,
  caHash: string,
  guardianItem: UserGuardianItem,
  userGuardiansList: UserGuardianItem[],
  guardiansStatus: GuardiansStatus,
) {
  const guardianToRemove = {
    identifierHash: guardianItem.identifierHash,
    type: guardianItem.guardianType,
    verificationInfo: {
      id: guardianItem.verifier?.id,
    },
  };
  const guardiansApproved = getGuardiansApproved(userGuardiansList, guardiansStatus);
  return contract?.callSendMethod('RemoveGuardian', address, {
    caHash,
    guardianToRemove,
    guardiansApproved: guardiansApproved,
  });
}

export function addGuardian(
  contract: ContractBasic,
  address: string,
  caHash: string,
  verifierInfo: VerifierInfo,
  guardianItem: UserGuardianItem,
  userGuardiansList: UserGuardianItem[],
  guardiansStatus: GuardiansStatus,
) {
  const { guardianIdentifier } = handleVerificationDoc(verifierInfo.verificationDoc);
  const guardianToAdd = {
    identifierHash: guardianIdentifier,
    type: guardianItem.guardianType,
    verificationInfo: {
      id: guardianItem.verifier?.id,
      signature: Object.values(Buffer.from(verifierInfo.signature as any, 'hex')),
      verificationDoc: verifierInfo.verificationDoc,
    },
  };
  const guardiansApproved = getGuardiansApproved(userGuardiansList, guardiansStatus);
  return contract?.callSendMethod('AddGuardian', address, {
    caHash,
    guardianToAdd: guardianToAdd,
    guardiansApproved: guardiansApproved,
  });
}

export function editGuardian(
  contract: ContractBasic,
  address: string,
  caHash: string,
  preGuardianItem: UserGuardianItem,
  guardianItem: UserGuardianItem,
  userGuardiansList: UserGuardianItem[],
  guardiansStatus: GuardiansStatus,
) {
  const guardianToUpdatePre = {
    identifierHash: preGuardianItem.identifierHash,
    type: preGuardianItem.guardianType,
    verificationInfo: {
      id: preGuardianItem.verifier?.id,
    },
  };
  const guardianToUpdateNew = {
    identifierHash: preGuardianItem.identifierHash,
    type: guardianItem.guardianType,
    verificationInfo: {
      id: guardianItem.verifier?.id,
    },
  };
  const guardiansApproved = getGuardiansApproved(userGuardiansList, guardiansStatus);
  return contract?.callSendMethod('UpdateGuardian', address, {
    caHash,
    guardianToUpdatePre,
    guardianToUpdateNew,
    guardiansApproved: guardiansApproved,
  });
}

export function setLoginAccount(
  contract: ContractBasic,
  address: string,
  caHash: string,
  verifierInfo: VerifierInfo,
  guardianItem: UserGuardianItem,
  userGuardiansList: UserGuardianItem[],
  guardiansStatus: GuardiansStatus,
) {
  const guardian = {
    identifierHash: guardianItem.identifierHash,
    type: guardianItem.guardianType,
    verificationInfo: {
      id: guardianItem.verifier?.id,
      signature: Object.values(Buffer.from(verifierInfo.signature as any, 'hex')),
      verificationDoc: verifierInfo.verificationDoc,
    },
  };
  const guardiansApproved = getGuardiansApproved(userGuardiansList, guardiansStatus);
  console.log('SetGuardianForLogin params', address, {
    caHash,
    guardian: guardian,
    guardiansApproved: guardiansApproved,
  });
  return contract?.callSendMethod('SetGuardianForLogin', address, {
    caHash,
    guardian: guardian,
    guardiansApproved: guardiansApproved,
  });
}

export function unsetLoginAccount(
  contract: ContractBasic,
  address: string,
  caHash: string,
  verifierInfo: VerifierInfo,
  guardianItem: UserGuardianItem,
  userGuardiansList: UserGuardianItem[],
  guardiansStatus: GuardiansStatus,
) {
  const guardian = {
    identifierHash: guardianItem.identifierHash,
    type: guardianItem.guardianType,
    verificationInfo: {
      id: guardianItem.verifier?.id,
      signature: Object.values(Buffer.from(verifierInfo.signature as any, 'hex')),
      verificationDoc: verifierInfo.verificationDoc,
    },
  };
  const guardiansApproved = getGuardiansApproved(userGuardiansList, guardiansStatus);
  console.log('UnsetGuardianForLogin params', address, {
    caHash,
    guardian: guardian,
    guardiansApproved: guardiansApproved,
  });
  return contract?.callSendMethod('UnsetGuardianForLogin', address, {
    caHash,
    guardian: guardian,
    guardiansApproved: guardiansApproved,
  });
}

export function removeManager(contract: ContractBasic, address: string, caHash: string, sendOptions?: SendOptions) {
  return contract?.callSendMethod(
    'RemoveManagerInfo',
    address,
    {
      caHash,
      managerInfo: {
        address,
        extraData: Date.now(),
      },
    },
    sendOptions,
  );
}

export function encodedDeletionManager(contract: ContractBasic, address: string, caHash: string) {
  return contract?.encodedTx('RemoveManagerInfo', {
    caHash,
    managerInfo: {
      address,
      extraData: Date.now(),
    },
  });
}

export function removeOtherManager(
  contract: ContractBasic,
  address: string,
  caHash: string,
  userGuardiansList: UserGuardianItem[],
  guardiansStatus: GuardiansStatus,
) {
  const managerInfo = {
    address,
    extraData: Date.now(),
  };
  const guardiansApproved = getGuardiansApproved(userGuardiansList, guardiansStatus);
  return contract?.callSendMethod('RemoveOtherManagerInfo', address, {
    caHash,
    managerInfo,
    guardiansApproved: guardiansApproved,
  });
}

export function modifyTransferLimit(
  contract: ContractBasic,
  address: string,
  caHash: string,
  userGuardiansList: UserGuardianItem[],
  guardiansStatus: GuardiansStatus,
  transferLimitDetail: ITransferLimitItem,
) {
  const guardiansApproved = getGuardiansApproved(userGuardiansList, guardiansStatus);
  return contract?.callSendMethod('SetTransferLimit', address, {
    caHash,
    symbol: transferLimitDetail.symbol,
    guardiansApproved: guardiansApproved,
    singleLimit: transferLimitDetail.singleLimit,
    dailyLimit: transferLimitDetail.dailyLimit,
  });
}
