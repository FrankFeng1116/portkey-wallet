import React, { useState, useCallback, useEffect, useMemo } from 'react';
import OverlayModal from '../OverlayModal';
import { FlatList, StyleSheet } from 'react-native';
import { ModalBody } from '../ModalBody';
import CommonInput from '../CommonInput';
import { TokenItemShowType } from '@portkey-wallet/types/types-ca/token';
import { AccountType } from '@portkey-wallet/types/wallet';
import TokenListItem from '../TokenListItem';
import { pTd } from '@portkey-wallet/rn-base/utils/unit';
import { useLanguage } from '@portkey-wallet/rn-base/i18n/hooks';
import { useAppCommonDispatch, useLatestRef } from '@portkey-wallet/hooks';
import useDebounce from '@portkey-wallet/rn-base/hooks/useDebounce';
import useEffectOnce from '@portkey-wallet/rn-base/hooks/useEffectOnce';
import { useChainIdList } from '@portkey-wallet/hooks/hooks-ca/wallet';
import { fetchAllTokenList } from '@portkey-wallet/store/store-ca/tokenManagement/api';
import NoData from '../NoData';
import myEvents from '@portkey-wallet/rn-base/utils/deviceEvent';
import { ChainId } from '@portkey-wallet/types';
import useToken from '@portkey-wallet/hooks/hooks-ca/useToken';
import useLockCallback from '@portkey-wallet/hooks/useLockCallback';
import { PAGE_SIZE_DEFAULT, PAGE_SIZE_IN_ACCOUNT_ASSETS } from '@portkey-wallet/constants/constants-ca/assets';
import { makeStyles, useGStyles } from '../../theme';

type onFinishSelectTokenType = (tokenItem: TokenItemShowType) => void;
type TokenListProps = {
  title?: string;
  currentSymbol?: string;
  currentChainId?: ChainId;
  account?: AccountType;
  onFinishSelectToken?: onFinishSelectTokenType;
};

const TokenList = ({ title = 'Select Token', onFinishSelectToken, currentSymbol, currentChainId }: TokenListProps) => {
  const { t } = useLanguage();
  const { tokenDataShowInMarket = [], totalRecordCount, fetchTokenInfoList } = useToken();

  const dispatch = useAppCommonDispatch();
  const chainIdList = useChainIdList();
  const gStyles = useGStyles();

  const [keyword, setKeyword] = useState('');
  const debounceKeyword = useDebounce(keyword, 800);

  const [filteredShowList, setFilteredShowList] = useState<TokenItemShowType[]>([]);
  const styles = useStyles();

  const renderItem = useCallback(
    ({ item }: { item: TokenItemShowType }) => (
      <TokenListItem
        noBalanceShow
        key={`${item.symbol}${item.chainId}`}
        item={item}
        currentSymbol={currentSymbol}
        currentChainId={currentChainId}
        onPress={() => {
          OverlayModal.hide();
          onFinishSelectToken?.(item);
        }}
      />
    ),
    [currentChainId, currentSymbol, onFinishSelectToken],
  );

  const getTokenList = useLockCallback(
    async (init?: boolean) => {
      if (debounceKeyword.trim()) return;
      if (totalRecordCount && tokenDataShowInMarket?.length >= totalRecordCount && !init) return;

      await fetchTokenInfoList({
        keyword: '',
        chainIdArray: chainIdList,
        skipCount: init ? 0 : tokenDataShowInMarket?.length,
        maxResultCount: PAGE_SIZE_IN_ACCOUNT_ASSETS,
      });
    },
    [chainIdList, debounceKeyword, fetchTokenInfoList, tokenDataShowInMarket?.length, totalRecordCount],
  );
  const getTokenListLatest = useLatestRef(getTokenList);

  const getTokenListWithKeyword = useLockCallback(async () => {
    if (!debounceKeyword) return;
    try {
      const result = await fetchAllTokenList({
        keyword: debounceKeyword,
        chainIdArray: chainIdList,
        skipCount: 0,
        maxResultCount: PAGE_SIZE_DEFAULT,
      });

      setFilteredShowList(result?.items?.map(item => item.token));
    } catch (error) {
      console.log('fetchTokenListByFilter error', error);
    }
  }, [chainIdList, debounceKeyword]);

  useEffect(() => {
    getTokenListWithKeyword();
  }, [chainIdList, debounceKeyword, dispatch, getTokenListWithKeyword]);

  useEffectOnce(() => {
    getTokenListLatest.current(true);
  });

  const noData = useMemo(() => {
    return debounceKeyword ? <NoData noPic message={t('There is no search result.')} /> : null;
  }, [debounceKeyword, t]);

  return (
    <ModalBody modalBodyType="bottom" title={title} style={gStyles.overlayStyle}>
      <CommonInput
        placeholder={t('Token Name')}
        containerStyle={styles.containerStyle}
        inputContainerStyle={styles.inputContainerStyle}
        inputStyle={styles.inputStyle}
        value={keyword}
        onChangeText={v => {
          setKeyword(v.trim());
        }}
      />
      <FlatList
        onLayout={e => {
          myEvents.nestScrollViewLayout.emit(e.nativeEvent.layout);
        }}
        disableScrollViewPanResponder={true}
        style={styles.flatList}
        onScroll={({ nativeEvent }) => {
          const {
            contentOffset: { y: scrollY },
          } = nativeEvent;
          if (scrollY <= 0) {
            myEvents.nestScrollViewScrolledTop.emit();
          }
        }}
        data={debounceKeyword ? filteredShowList : tokenDataShowInMarket}
        renderItem={renderItem}
        ListEmptyComponent={noData}
        keyExtractor={(item: any) => item.id || ''}
        onEndReached={() => getTokenListLatest.current()}
      />
    </ModalBody>
  );
};

export const showTokenList = (props: TokenListProps) => {
  OverlayModal.show(<TokenList {...props} />, {
    position: 'bottom',
    enabledNestScrollView: true,
  });
};

export default {
  showTokenList,
};

export const useStyles = makeStyles(theme => {
  return {
    title: {
      textAlign: 'center',
      color: theme.font5,
      height: pTd(22),
      lineHeight: pTd(22),
      marginTop: pTd(17),
      marginBottom: pTd(16),
      ...theme.mediumFont,
    },
    containerStyle: {
      marginLeft: pTd(16),
      width: pTd(343),
      marginBottom: pTd(8),
    },
    inputContainerStyle: {
      height: pTd(44),
    },
    inputStyle: {
      height: pTd(44),
    },
    flatList: {
      marginTop: pTd(8),
    },
  };
});
