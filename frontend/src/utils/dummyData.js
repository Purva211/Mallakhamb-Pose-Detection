export const poses = [
  {
    id: 1,
    name: 'Surya Namaskar',
    difficulty: 'Intermediate',
    description: 'Traditional sun salutation pose on the pole.',
    image: '/images/mallakhamb_pole.png',
    landmarks: 33,
    accuracy: 94.2
  },
  {
    id: 2,
    name: 'Hanuman Pose',
    difficulty: 'Advanced',
    description: 'A split leap performed on the Mallakhamb pole.',
    image: '/images/mallakhamb_rope.png',
    landmarks: 33,
    accuracy: 89.5
  },
  {
    id: 3,
    name: 'Padmasana',
    difficulty: 'Beginner',
    description: 'Lotus position balanced securely on the pole.',
    image: '/images/mallakhamb_action.png',
    landmarks: 33,
    accuracy: 97.1
  },
  {
    id: 4,
    name: 'Paschimottanasana',
    difficulty: 'Intermediate',
    description: 'Seated forward bend variations on the pole.',
    image: '/images/mallakhamb_pole.png',
    landmarks: 33,
    accuracy: 91.0
  },
  {
    id: 5,
    name: 'Natarajasana',
    difficulty: 'Advanced',
    description: 'Lord of the Dance Pose challenging balance and flexibility.',
    image: '/images/mallakhamb_rope.png',
    landmarks: 33,
    accuracy: 85.4
  },
  {
    id: 6,
    name: 'Vrikshasana',
    difficulty: 'Beginner',
    description: 'Tree pose performed vertically holding the pole.',
    image: '/images/mallakhamb_action.png',
    landmarks: 33,
    accuracy: 96.8
  }
];

export const dashboardStats = {
  imagesProcessed: 1247,
  videosProcessed: 389,
  liveSessions: 156,
  avgAccuracy: 91.8
};

export const poseDistribution = [
  { name: 'Beginner', value: 8 },
  { name: 'Intermediate', value: 7 },
  { name: 'Advanced', value: 5 }
];

export const performanceData = [
  { name: 'Mon', accuracy: 88 },
  { name: 'Tue', accuracy: 90 },
  { name: 'Wed', accuracy: 89 },
  { name: 'Thu', accuracy: 92 },
  { name: 'Fri', accuracy: 95 },
  { name: 'Sat', accuracy: 94 },
  { name: 'Sun', accuracy: 96 },
];

export const recentActivity = [
  { id: '101', type: 'Image', pose: 'Hanuman Pose', accuracy: '89%', date: '2023-11-01', status: 'Completed' },
  { id: '102', type: 'Video', pose: 'Multiple', accuracy: '92%', date: '2023-11-02', status: 'Completed' },
  { id: '103', type: 'Live', pose: 'Surya Namaskar', accuracy: '95%', date: '2023-11-03', status: 'Completed' },
  { id: '104', type: 'Image', pose: 'Padmasana', accuracy: '98%', date: '2023-11-04', status: 'Completed' },
  { id: '105', type: 'Video', pose: 'Natarajasana', accuracy: '85%', date: '2023-11-04', status: 'Processing' },
];

export const mockImageResult = {
  poleDetected: true,
  personDetected: true,
  poseName: 'Hanuman Pose',
  confidence: 92.4,
  accuracy: 88.7,
  grade: 'A',
  corrections: [
    'Straighten left leg alignment',
    'Improve grip height on pole'
  ]
};
