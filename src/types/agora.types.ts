// Agora Types for Video Conferencing
import type {
    IAgoraRTCClient,
    ICameraVideoTrack,
    IMicrophoneAudioTrack,
    IRemoteVideoTrack,
    IRemoteAudioTrack,
    IAgoraRTCRemoteUser,
    ILocalVideoTrack,
} from 'agora-rtc-sdk-ng';

export type { IAgoraRTCClient, ICameraVideoTrack, IMicrophoneAudioTrack, IRemoteVideoTrack, IRemoteAudioTrack, IAgoraRTCRemoteUser, ILocalVideoTrack };

export interface AgoraConfig {
    appId: string;
    channelName: string;
    token: string;
    uid: number;
}

export interface RemoteUser {
    uid: number | string;
    hasVideo: boolean;
    hasAudio: boolean;
    videoTrack?: IRemoteVideoTrack;
    audioTrack?: IRemoteAudioTrack;
}

export interface UseAgoraReturn {
    isJoined: boolean;
    isLoading: boolean;
    error: string | null;
    localVideoTrack: ICameraVideoTrack | ILocalVideoTrack | null;
    localAudioTrack: IMicrophoneAudioTrack | null;
    remoteUsers: RemoteUser[];
    isMicMuted: boolean;
    isCamOff: boolean;
    isScreenSharing: boolean;
    toggleMic: () => Promise<void>;
    toggleCam: () => Promise<void>;
    startScreenShare: (sourceId?: string) => Promise<void>;
    stopScreenShare: () => Promise<void>;
    leave: () => Promise<void>;
}

export interface JoinMeetingPayload {
    meetingId: number;
    agoraToken: string;
    appId: string;
    channelName: string;
    uid: number;
}
