import { useCallback, useMemo } from 'react';
import { useAppCASelector, useAppCommonDispatch } from '../../index';
import ramp from '@portkey-wallet/ramp';
import { sleep } from '@portkey-wallet/utils';
import { setRampEntry } from '@portkey-wallet/store/store-ca/ramp/actions';
import { useBuyFiat } from './buy';
import { useSellCrypto } from './sell';
import { useIsMainnet } from '../network';

export const useRampState = () => useAppCASelector(state => state.ramp);

export const useBuyFiatListState = () => useAppCASelector(state => state.ramp.buyFiatList);
export const useBuyDefaultFiatState = () => useAppCASelector(state => state.ramp.buyDefaultFiat);
export const useBuyDefaultCryptoListState = () => useAppCASelector(state => state.ramp.buyDefaultCryptoList);
export const useBuyDefaultCryptoState = () => useAppCASelector(state => state.ramp.buyDefaultCrypto);

export const useSellCryptoListState = () => useAppCASelector(state => state.ramp.sellCryptoList);
export const useSellDefaultCryptoState = () => useAppCASelector(state => state.ramp.sellDefaultCrypto);
export const useSellDefaultFiatListState = () => useAppCASelector(state => state.ramp.sellDefaultFiatList);
export const useSellDefaultFiatState = () => useAppCASelector(state => state.ramp.sellDefaultFiat);

export const useInitRamp = () => {
  const { refreshRampShow } = useRampStateShow();
  const { refreshBuyFiat } = useBuyFiat();
  const { refreshSellCrypto } = useSellCrypto();

  return useCallback(async () => {
    const { isBuySectionShow, isSellSectionShow } = await refreshRampShow();

    await sleep(1000);

    if (isBuySectionShow) {
      // fetch fiatList and defaultFiat
      await refreshBuyFiat();
    }

    if (isSellSectionShow) {
      // fetch cryptoList and defaultCrypto
      await refreshSellCrypto();
    }
  }, [refreshRampShow, refreshBuyFiat, refreshSellCrypto]);
};

export const useRampStateShow = () => {
  const dispatch = useAppCommonDispatch();
  const isMainnet = useIsMainnet();
  const { rampEntry } = useRampState();

  const isBuySectionShow = useMemo(
    () => isMainnet && rampEntry.isBuySectionShow,
    [isMainnet, rampEntry.isBuySectionShow],
  );

  const isSellSectionShow = useMemo(
    () => isMainnet && rampEntry.isSellSectionShow,
    [isMainnet, rampEntry.isSellSectionShow],
  );

  const isRampShow = useMemo(() => isMainnet && rampEntry.isRampShow, [isMainnet, rampEntry.isRampShow]);

  const refreshRampShow = useCallback(async () => {
    await ramp.refreshRampProvider();
    const rampProviders = ramp.providerMap;

    const isBuySectionShowNew = Object.keys(rampProviders).some(key => {
      return rampProviders[key].coverage.buy === true;
    });
    const isSellSectionShowNew = Object.keys(rampProviders).some(key => {
      return rampProviders[key].coverage.sell === true;
    });
    const isRampShowNew = isBuySectionShowNew || isSellSectionShowNew;

    dispatch(
      setRampEntry({
        isRampShow: isRampShowNew,
        isBuySectionShow: isBuySectionShowNew,
        isSellSectionShow: isSellSectionShowNew,
      }),
    );

    return {
      isRampShow: isMainnet && isRampShowNew,
      isBuySectionShow: isMainnet && isBuySectionShowNew,
      isSellSectionShow: isMainnet && isSellSectionShowNew,
    };
  }, [dispatch, isMainnet]);

  return {
    isRampShow,
    isBuySectionShow,
    isSellSectionShow,
    refreshRampShow,
  };
};

export * from './buy';
export * from './sell';
