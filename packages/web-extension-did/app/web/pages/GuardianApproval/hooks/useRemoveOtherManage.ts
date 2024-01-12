import { useCurrentChain } from '@portkey-wallet/hooks/hooks-ca/chainList';
import { useCurrentNetworkInfo } from '@portkey-wallet/hooks/hooks-ca/network';
import { useCurrentWallet, useOriginChainId } from '@portkey-wallet/hooks/hooks-ca/wallet';
import singleMessage from 'utils/singleMessage';
import { DEVICE_TYPE } from 'constants/index';
import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useGuardiansInfo, useLoading } from 'store/Provider/hooks';
import { removeOtherManager } from 'utils/sandboxUtil/removeOtherManager';
import { handleErrorMessage, sleep } from '@portkey-wallet/utils';
import { formatGuardianValue } from '../utils/formatGuardianValue';
import qs from 'query-string';
import ModalTip from 'pages/components/ModalTip';
import getSeed from 'utils/getSeed';

export const useRemoveOtherManage = () => {
  const { setLoading } = useLoading();
  const { walletInfo } = useCurrentWallet();

  const originChainId = useOriginChainId();
  const currentChain = useCurrentChain(originChainId);
  const { state, search } = useLocation();
  const navigate = useNavigate();
  const currentNetwork = useCurrentNetworkInfo();
  const { userGuardianStatus } = useGuardiansInfo();
  const query = useMemo(() => {
    if (search) {
      const { detail } = qs.parse(search);
      return detail;
    } else {
      return state;
    }
  }, [search, state]);

  return useCallback(async () => {
    try {
      setLoading(true);
      const manageAddress = query?.split('_')[1];
      const { privateKey } = await getSeed();
      if (!currentChain?.endPoint || !privateKey) return singleMessage.error('remove manage error');
      const { guardiansApproved } = formatGuardianValue(userGuardianStatus);
      await removeOtherManager({
        rpcUrl: currentChain.endPoint,
        chainType: currentNetwork.walletType,
        address: currentChain.caContractAddress,
        privateKey,
        paramsOption: {
          caHash: walletInfo?.caHash as string,
          managerInfo: {
            address: manageAddress,
            extraData: `${DEVICE_TYPE},${Date.now()}`,
          },
          guardiansApproved,
        },
      });
      setLoading(false);
      ModalTip({
        content: 'Requested successfully',
        onClose: async () => {
          await sleep(1000);
          navigate('/setting/wallet-security/manage-devices');
        },
      });
    } catch (error: any) {
      setLoading(false);
      console.log('---remove-other-manage-error', error);
      const _error = handleErrorMessage(error, 'Try again later');
      singleMessage.error(_error);
    }
  }, [currentChain, currentNetwork.walletType, navigate, query, setLoading, userGuardianStatus, walletInfo?.caHash]);
};
