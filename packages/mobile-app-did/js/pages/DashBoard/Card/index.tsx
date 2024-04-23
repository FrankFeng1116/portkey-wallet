import React, { useMemo } from 'react';
import { View, Text, StyleProp, ViewProps } from 'react-native';
import Svg from 'components/Svg';
import { styles } from './style';
import SendButton from 'components/SendButton';
import ReceiveButton from 'components/ReceiveButton';
import ActivityButton from 'pages/DashBoard/ActivityButton';

import { TextM } from 'components/CommonText';
import navigationService from 'utils/navigationService';
import { defaultColors } from 'assets/theme';
import { useCurrentUserInfo } from '@portkey-wallet/hooks/hooks-ca/wallet';
import { useQrScanPermissionAndToast } from 'hooks/useQrScan';
import { useIsMainnet } from '@portkey-wallet/hooks/hooks-ca/network';
import { useAccountBalanceUSD } from '@portkey-wallet/hooks/hooks-ca/balances';
import FaucetButton from 'components/FaucetButton';
import GStyles from 'assets/theme/GStyles';
import DepositButton from 'components/DepositButton';
import { DepositItem, useDepositList } from 'hooks/deposit';
import Touchable from 'components/Touchable';
import { formatAmountUSDShow } from '@portkey-wallet/utils/converter';

const Card: React.FC = () => {
  const isMainnet = useIsMainnet();
  const userInfo = useCurrentUserInfo();
  const accountBalanceUSD = useAccountBalanceUSD();
  const qrScanPermissionAndToast = useQrScanPermissionAndToast();
  const depositList = useDepositList();
  const isDepositShow = useMemo(() => !!depositList.length, [depositList.length]);
  const buttonCount = useMemo(() => {
    let count = 3;
    if (isDepositShow) count++;
    // FaucetButton
    if (!isMainnet) count++;
    return count;
  }, [isDepositShow, isMainnet]);

  const buttonGroupWrapStyle = useMemo(
    () => (buttonCount < 5 ? (GStyles.flexCenter as StyleProp<ViewProps>) : undefined),
    [buttonCount],
  );
  const buttonWrapStyle = useMemo(
    () => (buttonCount < 5 ? (styles.buttonWrapStyle1 as StyleProp<ViewProps>) : undefined),
    [buttonCount],
  );

  return (
    <View style={[styles.cardWrap]}>
      <View style={styles.refreshWrap}>
        <Text style={styles.block} />
        <Touchable
          style={styles.svgWrap}
          onPress={async () => {
            if (!(await qrScanPermissionAndToast())) return;
            navigationService.navigate('QrScanner');
          }}>
          <Svg icon="scan" size={22} color={defaultColors.black} />
        </Touchable>
      </View>
      <View style={styles.textColumn}>
        <TextM style={styles.accountName}>{userInfo?.nickName}</TextM>
        <Text style={styles.usdtBalance}>{isMainnet ? formatAmountUSDShow(accountBalanceUSD) : 'Dev Mode'}</Text>
      </View>
      <View style={[GStyles.flexRow, GStyles.spaceBetween, styles.buttonGroupWrap, buttonGroupWrapStyle]}>
        {isDepositShow && <DepositButton wrapStyle={buttonWrapStyle} list={depositList as DepositItem[]} />}
        <SendButton themeType="dashBoard" wrapStyle={buttonWrapStyle} />
        <ReceiveButton themeType="dashBoard" wrapStyle={buttonWrapStyle} />
        {!isMainnet && <FaucetButton themeType="dashBoard" wrapStyle={buttonWrapStyle} />}
        <ActivityButton themeType="dashBoard" wrapStyle={buttonWrapStyle} />
      </View>
    </View>
  );
};

export default Card;
