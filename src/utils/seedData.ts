import { Photo, EventSettings, GuestWish, ChatMessage } from '../types';

export const initialEventSettings: EventSettings = {
  title: 'Pernikahan Suci',
  coupleNames: 'Fajar & Aulia',
  date: '25 Oktober 2025',
  venue: 'Sampoerna Strategic Square, Jakarta',
  maxCapacity: 1000,
  maxPerGuest: 36,
  autoModeration: true,
  limit36Photos: true,
  guestPrivacy: false
};

export const initialPhotos: Photo[] = [
  {
    id: 'photo-1',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDXMkweGvEM5kLZBIgQ_UANVn_x2963iLNtC78omrADoLwYmbiD20fS5lfq_lsQaUn6YUbRpMrEVBmmEr8br4MqYisdbdsxZYN87lwnFPQ7niqhmjje4KTryfdUKGpx4LZezqyi39nrBYerA-ByR0Bp0RW-auQrgBo22TrjSlpMqf_tlhSjfeDy0PZpCT-cIjp6WMUIAurRP2l4fYzGQARgqs6tx5DbYBFlSr3_7Lh1PKY55k_V8LcBlA',
    caption: 'Ijab Kabul Penuh Khidmat',
    author: 'Keluarga Meja 4',
    authorInitials: 'M4',
    table: 'Meja 4',
    category: 'akad',
    timestamp: '10:14 WIB',
    timeAgo: '10 menit lalu',
    status: 'saved',
    likes: 42,
    frameNumber: 1,
    isUserPhoto: false
  },
  {
    id: 'photo-2',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCCEMN0MpZO4n3HuJqVz0Qvzz314MbtOx0ZJX_l0Q4vZv_731NG2DZlyD9aULwqrOKaKTvJ9P78kJma3l_NXiN653y3pFYmIGRFpEUCezV8VnDcKxFmvTBAVhhwVIb_BYZyZLktLfUYmTapARz5lGGbGNS1gFpbGpJ2eboLdN7_9cpp-pHs1QnpjMRPNHKjdy4LBJ4utRmupMcJeS_UE5JxAfTdbXl4-DNX4MIn7VX8iM_XFB3Q5mdKNw',
    caption: 'Dansa Pertama Romantis',
    author: 'Dimas Nugroho (Bestman)',
    authorInitials: 'DN',
    table: 'Meja Bestman',
    category: 'resepsi',
    timestamp: '10:32 WIB',
    timeAgo: '24 menit lalu',
    status: 'uploading',
    likes: 89,
    frameNumber: 2,
    isUserPhoto: false
  },
  {
    id: 'photo-3',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD8cjvdxVmPF1ut1bZi-cM7JK5m2Zcida--HEQuaE4c5ncBLoy9HoOxHFlrpEGQNfRphmRwQLmwrAMq9KJ0Hh0mD7UeAWXbAgAhdOl_gi2r7IK8gmKpNReEmJzXrO6fG4u1Qn7pGVaU_Kbti7h6dyYl6v3n4u5NCFzIcUhetJIn_-CP4tGLCBE00eRGlH9HF7yyTRc1fDU0kEF03ABVT7T1O9OaVzSG3u4N5Ktwn8TqPZn40NtVQB5CWA',
    caption: 'Sungkeman Penuh Haru',
    author: 'Tamu VIP',
    authorInitials: 'TV',
    table: 'VIP 02',
    category: 'akad',
    timestamp: '11:05 WIB',
    timeAgo: '35 menit lalu',
    status: 'failed',
    likes: 28,
    frameNumber: 3,
    isUserPhoto: false
  },
  {
    id: 'photo-4',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAaTgYOQGkOoNnfNnf9sv2vPECWf7Nhzc9keRrSrbSoTkn3-hq1WjoeMDVLaXSQnvKHp2hn_Xsg_DKdwgK0hhOYF0t9uFRlSHVtYkGNbIVhq4nWy1BqUT8GStuXTLMzIq75HvfiQv1Oahth3FiJ8wY1jJj9I-vI2soefl4pzjICRNhBdymVSMTwCJYnXXm8_F8Lk-vm65nOtsWwFRD84Qf25MOj8sCglIPaaGy_gFyKCwJ2An41XQHbXQ',
    caption: 'Cincin & Janji Suci',
    author: 'Fotografer Tamu',
    authorInitials: 'FT',
    table: 'Meja 1',
    category: 'akad',
    timestamp: '11:20 WIB',
    timeAgo: '40 menit lalu',
    status: 'saved',
    likes: 56,
    frameNumber: 4,
    isUserPhoto: false
  },
  {
    id: 'photo-5',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCkNg3LJzc6zOhDLS8GFVPG4-yOQBFvmHSOz59SNRIaOtEiqLBxihGgYpCyztX-DWS27hmyPNUry2r2yUKlo9lG4DD3i9afWHWNzdf1Pb0OIjsMlUu-8o2nq0lsivCEIPg_DP8GP2Shgp7tM-NAsdUKC6erMwgwAI_HvoFMrz8C1tCegjHHLAHONXxufVakIWW2NY7Y3M4kkPu0Asvtm7eXdu6_FOir1fzHgCs_joK2EHMTP7uHQp_UZw',
    caption: 'Lemparan Buket Bunga',
    author: 'Keluarga Mempelai',
    authorInitials: 'KM',
    table: 'Meja 3',
    category: 'resepsi',
    timestamp: '11:45 WIB',
    timeAgo: '50 menit lalu',
    status: 'saved',
    likes: 71,
    frameNumber: 5,
    isUserPhoto: false
  },
  {
    id: 'photo-6',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCKTBb5VGlgfAU9rSVw69fmhwTw0-IP4p5FnVgndoOv49oui_NLGO0UsEgtQBvf9l5NmDAN471_wDwwpjzTwqIYF7KIU-CJo_TJn59LVqjxMYasQJeB95f-D4sLFXP3LX7qXzZBqVzjPRVDGDx7S4cL2u844TQZ-snC7CCP2dxM2MEvdbAoZ6ASZ8mhJCO_aZb9-lZ9mYOQ9VV4pRvEdjyzqqaPEUuQU4IbJXF85RHTZLhznVdH0jt2yA',
    caption: 'Canda Tamu Meja 8',
    author: 'Sahabat Meja 8',
    authorInitials: 'S8',
    table: 'Meja 8',
    category: 'candid',
    timestamp: '12:10 WIB',
    timeAgo: '45 menit lalu',
    status: 'saved',
    likes: 19,
    frameNumber: 6,
    isUserPhoto: false
  },
  {
    id: 'photo-7',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAHGCFjMHibXi4kA-elMJP3kPS6ALKPQpBpnATjiIXP0AdDHuYobuVrm0gS0KytR7P_AOwHcj312Ipw_IW3JBr_fa_rtoFaeUXNY0YC0ZK4sFCq9U0hu0I0-nwJQSJP70TvRilN1WISKLpklVTmw4V1QONbb4L_8DAT5QuBCDnbejLPnL8zcs_kcd79vplGJwNtR9emnKZeX1wjKJsTkeuX89I5X0nm4mFx90AP62aV1ZZmnPofcpS_NQ',
    caption: 'Pose Seru Tim Bridesmaid',
    author: 'Tia & Rania',
    authorInitials: 'TR',
    table: 'Bridesmaids',
    category: 'photobooth',
    timestamp: '12:35 WIB',
    timeAgo: '1 jam lalu',
    status: 'saved',
    likes: 64,
    frameNumber: 7,
    isUserPhoto: false
  },
  {
    id: 'photo-8',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuALqqgXFDCN_4IdlacBsDqXoX0-mLWA2xakYjs9asn12IxqyFytfWZec7d0opKy_xKzKw51mSTKM2cY_6xfM3gSAKp34u8-jpoKdaqJeAIqg-IcodNeKrp51qyweAn6PTTp6sxyPJdbJ4APnBdgrELNrUoVKdnrTOTC-rn6O7cLFeBh8UP2-8bqFBFDLWgLncpzVfz2JSkx9HdOY0VbQeG-Qv3N2-JAKYzJC0IFbgRP-5YhOv4sJiqP6g',
    caption: 'Aulia Tersenyum Bahagia',
    author: 'Dinda & Rian',
    authorInitials: 'DR',
    table: 'Meja VIP 03',
    category: 'candid',
    timestamp: '13:00 WIB',
    timeAgo: 'Baru saja',
    status: 'saved',
    likes: 95,
    frameNumber: 8,
    isUserPhoto: false
  },
  {
    id: 'photo-9',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCJL6UumDrvZMobxvxsr5GGcDbxdl8fjxBm1DnN05lP4KqiCmvCaZSashKvDwNFtEq72KcfLveRCX-LUCJRN1j6xIjAngNSdngNoIPF3lL9EmAXGX0BWGs0KYfdM8J0qsn0xzSVmTYNurPHrbdHiG9hX52JtSmumiJFLQn9WH6zX0_GnoR8cbZmGvxW7qLkoKpv8Ce-TKce7G75cE_1O1wMOokDWnlhai16eXgYkxTNB4_raMBVStjLjA',
    caption: 'Fajar Tertawa Bersama Bestmen',
    author: 'Bagas Arya',
    authorInitials: 'BA',
    table: 'Meja Sahabat SMA',
    category: 'candid',
    timestamp: '13:05 WIB',
    timeAgo: '3 mnt lalu',
    status: 'saved',
    likes: 38,
    frameNumber: 9,
    isUserPhoto: false
  }
];

export const initialWishes: GuestWish[] = [
  {
    id: 'wish-1',
    author: 'Dimas & Nadia',
    table: 'Meja Bestman',
    message: 'Bahagia selalu hingga akhir hayat, Fajar & Aulia! Acara yang luar biasa megah dan hangat.',
    timestamp: '12:45 WIB'
  },
  {
    id: 'wish-2',
    author: 'Keluarga Om Eko',
    table: 'Meja Keluarga Besar',
    message: 'Semoga menjadi keluarga yang sakinah, mawaddah, warahmah. Doa terbaik untuk kalian berdua!',
    timestamp: '13:10 WIB'
  }
];

export const initialGuestActivities = [
  {
    id: 'act-1',
    author: 'Dinda & Rian',
    initials: 'DR',
    table: 'Meja VIP 03',
    timeAgo: 'Baru saja',
    photoCount: 3,
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC2rOEQ1mxaY5K5WUYuqEVQ4kSJRHyC0QL78aBrCHP8McjOC5IlNbrAAst3biyAveSKZQGfveqHM18hf806P0w6HabRZbDZYU8NO9MHHjf1DDqSmLPY2phXSOwVN5slhrtce8w_ixHeCJOATiRW-p1iLsw89shXSiVQJxSPPrc-xfi368awecY31onA0T8UG5aM7okm5QLIfexMJ8TyfKvdIOOm4OrI_KqsxfPv4H7IHjkLJxTBbV_Bjg'
  },
  {
    id: 'act-2',
    author: 'Bagas Arya',
    initials: 'BA',
    table: 'Meja Sahabat SMA',
    timeAgo: '3 mnt lalu',
    photoCount: 1,
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA2vnE5r_RmsP0_r-efFSkvi0WtHFlLGLsssfXfZtgYuaBlUdB_ikAtzSNgxUynj2syBMm4TvST9iHz5vQe5KkQCR41P41kB4HH0OGHAoMfqo7x__M1wONrHXB1odB6ZGJjIycBYZq6-SjkSQy2WmPQr8GFHbqS8hyX9Wy977SDxWyty3kM0vJqDQYIu3f20b6hkmjsRjlTAR86j-MhoZImpEaupXtC2eBIiBGQDirYCt2UDvqnp-TuTg'
  },
  {
    id: 'act-3',
    author: 'Tante Widya & Om Eko',
    initials: 'TW',
    table: 'Meja Keluarga Besar',
    timeAgo: '8 mnt lalu',
    photoCount: 1,
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCEPRAxuILCiiA1IzpsHz2SXVmiDebFxj5pmGgAxz2PiJH-LX86qI4qjnu8NeqIxhJEyaHY4xl0R8PBL6fzeV1Y0IGqiGoIfXRuXw6I3PYyoePAJHemUNme4TN_poCH8BzXa24-_me_TPXTLXOyRz82KPt4kLjSOTcJUBXa9wQKLToHDXCDzu-8cWF294bfczVUkVH5spbKvILOK9HVy61F_NaIMKO-O-UUL_0ktmomW0paQeYv7Zsk4Q'
  }
];

export const initialChatMessages: ChatMessage[] = [
  {
    id: 'msg-1',
    senderName: 'Dimas Prasetyo',
    senderInitials: 'DP',
    relationship: 'Sahabat Fajar',
    address: 'Bandung • Meja Bestman',
    message: 'Selamat menempuh hidup baru Fajar & Aulia! 🎉 Semoga menjadi keluarga sakinah mawaddah warahmah. Bro Fajar gagah banget hari ini!',
    timestamp: '11:15 WIB',
    reactions: { '❤️': 8, '👏': 5 }
  },
  {
    id: 'msg-2',
    senderName: 'Nadia Salsabila',
    senderInitials: 'NS',
    relationship: 'Sahabat Aulia',
    address: 'Jakarta Selatan • Meja Bridesmaids',
    message: 'MasyaAllah Aulia cantik banget pangling poll! 🥹✨ Selamat yaa sayang, langgeng bahagia sampai kakek nenek!',
    timestamp: '11:22 WIB',
    reactions: { '❤️': 12, '🎉': 4 }
  },
  {
    id: 'msg-3',
    senderName: 'Pak Hendro Kusumo',
    senderInitials: 'HK',
    relationship: 'Keluarga Fajar',
    address: 'Surabaya • Meja VIP 01',
    message: 'Alhamdulillah prosesi akad nikah berjalan lancar & khidmat. Selamat untuk kedua mempelai dan besan sekalian. Doa terbaik dari keluarga Surabaya 🤲',
    timestamp: '11:40 WIB',
    reactions: { '🤲': 15, '❤️': 6 }
  },
  {
    id: 'msg-4',
    senderName: 'Bagas Arya',
    senderInitials: 'BA',
    relationship: 'Teman Kuliah / Sekolah',
    address: 'Yogyakarta • Meja 08',
    message: 'Akhirnya sah juga yaa setelah perjalanan panjang! Ditunggu traktiran jalan-jalannya brader! 🥂 Selamat Fajar & Aulia!',
    timestamp: '12:05 WIB',
    reactions: { '🥂': 7, '😂': 4 }
  },
  {
    id: 'msg-5',
    senderName: 'Rina & Irfan',
    senderInitials: 'RI',
    relationship: 'Rekan Kerja',
    address: 'Tangerang • Meja 05',
    message: 'Selamat berbahagia Fajar & Aulia! Dekorasi dan makanannya luar biasa sedap! Sukses selalu karier dan rumah tangganya yaa 💐✨',
    timestamp: '12:30 WIB',
    reactions: { '❤️': 9, '🌸': 3 }
  }
];


