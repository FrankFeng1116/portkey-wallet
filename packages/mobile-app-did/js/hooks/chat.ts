import { useCallback } from 'react';
import { useCreateP2pChannel } from '@portkey-wallet/hooks/hooks-ca/im';
import { setCurrentChannel, setReplyMessageInfo } from 'pages/Chat/context/chatsContext';
import { useChatsDispatch } from 'pages/Chat/context/hooks';
import navigationService from 'utils/navigationService';
import CommonToast from 'components/CommonToast';
import myEvents from 'utils/deviceEvent';
import { ChatTabName } from '@portkey-wallet/constants/constants-ca/chat';
import { sleep } from '@portkey-wallet/utils';
import { useThrottleCallback } from '@portkey-wallet/hooks';
import { parseLinkPortkeyUrl } from 'utils/scheme';
import { useDiscoverJumpWithNetWork } from './discover';
import { useHandlePortkeyId, useHandleGroupId } from './useQrScan';
import { useIsChatShow } from '@portkey-wallet/hooks/hooks-ca/cms';
const WWW_URL_PATTERN = /^www\./i;

export function useJumpToChatDetails() {
  const chatDispatch = useChatsDispatch();
  const createChannel = useCreateP2pChannel();

  return useCallback(
    async ({ toRelationId, channelUuid }: { toRelationId?: string; channelUuid?: string }) => {
      try {
        if (channelUuid) {
          chatDispatch(
            setCurrentChannel({
              currentChannelId: channelUuid || '',
              currentChannelType: 'P2P',
            }),
          );
        } else {
          const channelInfo = await createChannel(toRelationId || '');
          chatDispatch(
            setCurrentChannel({
              currentChannelId: channelInfo.channelUuid || '',
              currentChannelType: 'P2P',
            }),
          );
        }
        chatDispatch(setReplyMessageInfo());

        const routesArr = navigationService.getState()?.routes;

        if (routesArr[routesArr.length - 1].name === 'Tab') {
          navigationService.navigate('ChatDetailsPage');
        } else {
          navigationService.reset([{ name: 'Tab' }, { name: 'ChatDetailsPage' }]);
        }
        await sleep(1000);
        myEvents.navToBottomTab.emit({ tabName: ChatTabName });
      } catch (error) {
        console.log(error);
        CommonToast.failError(error);
      }
    },
    [chatDispatch, createChannel],
  );
}

export function useJumpToChatGroupDetails() {
  const chatDispatch = useChatsDispatch();
  const createChannel = useCreateP2pChannel();

  return useCallback(
    async ({ toRelationId, channelUuid }: { toRelationId?: string; channelUuid?: string }) => {
      try {
        if (channelUuid) {
          chatDispatch(
            setCurrentChannel({
              currentChannelId: channelUuid || '',
              currentChannelType: 'Group',
            }),
          );
        } else {
          const channelInfo = await createChannel(toRelationId || '');
          chatDispatch(
            setCurrentChannel({
              currentChannelId: channelInfo.channelUuid || '',
              currentChannelType: 'Group',
            }),
          );
        }

        const routesArr = navigationService.getState()?.routes;

        if (routesArr[routesArr.length - 1].name === 'Tab') {
          navigationService.navigate('ChatGroupDetailsPage');
        } else {
          navigationService.reset([{ name: 'Tab' }, { name: 'ChatGroupDetailsPage' }]);
        }

        chatDispatch(setReplyMessageInfo());
        await sleep(1000);
        myEvents.navToBottomTab.emit({ tabName: ChatTabName });
      } catch (error) {
        console.log(error);
        CommonToast.failError(error);
      }
    },
    [chatDispatch, createChannel],
  );
}

export function useOnUrlPress() {
  const jump = useDiscoverJumpWithNetWork();
  const handlePortkeyId = useHandlePortkeyId();
  const handleGroupId = useHandleGroupId();
  const isChatShow = useIsChatShow();

  return useThrottleCallback(
    (url: string) => {
      if (WWW_URL_PATTERN.test(url)) url = `https://${url}`;
      const { id, type } = parseLinkPortkeyUrl(url);

      if (type === 'addContact' && isChatShow)
        return handlePortkeyId({
          portkeyId: id,
          showLoading: true,
        });

      if (type === 'addGroup' && isChatShow)
        return handleGroupId({
          channelId: id,
          showLoading: true,
        });

      jump({ item: { url: url, name: url } });
    },
    [jump, isChatShow],
  );
}
