import { useCallback } from 'react';
import { useWalletInfo } from 'store/Provider/hooks';
import WalletNamePopup from './Popup';
import WalletNamePrompt from './Prompt';
import { useNavigate } from 'react-router';
import { useCommonState } from 'store/Provider/hooks';
import { useIsMainnet } from '@portkey-wallet/hooks/hooks-ca/network';
import { IProfileDetailDataProps } from 'types/Profile';
import { useProfileEdit, useProfileAddContact, useProfileChat, useProfileCopy } from 'hooks/useProfile';
import { useTranslation } from 'react-i18next';

export default function WalletName() {
  const { isNotLessThan768 } = useCommonState();
  const navigate = useNavigate();
  const isMainnet = useIsMainnet();
  const { walletName } = useWalletInfo();
  const { t } = useTranslation();
  const editText = t('Edit');

  // TODO fetch profile
  const state: IProfileDetailDataProps = {
    index: 'B',
    name: 'by',
    addresses: [{ chainId: 'AELF', address: 'H8CXvfy8hm' }],
    portkeyId: '111111',
    relationOneId: '111',
  };
  const headerTitle = isMainnet ? walletName : t('My DID');

  const handleEdit = useProfileEdit();
  const handleAdd = useProfileAddContact();
  const handleChat = useProfileChat();
  const handleCopy = useProfileCopy();
  const goBack = useCallback(() => navigate('/setting/wallet'), [navigate]);

  return isNotLessThan768 ? (
    <WalletNamePrompt
      headerTitle={headerTitle}
      data={state}
      editText={editText}
      goBack={goBack}
      handleEdit={() => handleEdit(state)}
      handleAdd={() => handleAdd(state)}
      handleChat={() => handleChat(state)}
      handleCopy={handleCopy}
    />
  ) : (
    <WalletNamePopup
      headerTitle={headerTitle}
      data={state}
      editText={editText}
      goBack={goBack}
      handleEdit={() => handleEdit(state)}
      handleAdd={() => handleAdd(state)}
      handleChat={() => handleChat(state)}
      handleCopy={handleCopy}
    />
  );
}
