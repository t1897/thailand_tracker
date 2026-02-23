
export interface Place {
  id: string;
  name: string;
  location: string;
  dateAdded: string;
  image: string;
  isMarked: boolean;
  category?: string;
  description?: string;
}

export const places: Place[] = [
  {
    id: '1',
    name: 'Wat Arun',
    location: 'Bangkok',
    dateAdded: '12 Oct 2023',
    image: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?q=80&w=2592&auto=format&fit=crop',
    isMarked: true,
    category: 'Temple',
    description: 'The Temple of Dawn, a stunning riverside landmark.'
  },
  {
    id: '2',
    name: 'Maya Bay',
    location: 'Krabi',
    dateAdded: '05 Jan 2023',
    image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=2639&auto=format&fit=crop',
    isMarked: true,
    category: 'Beach',
    description: 'Famous bay with limestone cliffs and clear waters.'
  },
  {
    id: '3',
    name: 'Doi Inthanon',
    location: 'Chiang Mai',
    dateAdded: '22 Dec 2022',
    image: 'https://images.unsplash.com/photo-1590523278135-c59843e95078?q=80&w=2648&auto=format&fit=crop',
    isMarked: true,
    category: 'Mountain',
    description: 'The highest mountain in Thailand.'
  },
  {
    id: '4',
    name: 'Ayutthaya Historical Park',
    location: 'Ayutthaya',
    dateAdded: '15 Nov 2022',
    image: 'https://images.unsplash.com/photo-1528181304800-259b08848526?q=80&w=2670&auto=format&fit=crop',
    isMarked: true,
    category: 'History',
    description: 'Ancient capital ruins with stone Buddha statues.'
  },
  {
    id: '5',
    name: 'Wat Rong Khun',
    location: 'Chiang Rai',
    dateAdded: '02 Sep 2022',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=2592&auto=format&fit=crop',
    isMarked: true,
    category: 'Temple',
    description: 'The famous White Temple, a contemporary art exhibit.'
  },
  {
    id: '6',
    name: 'Floating Market',
    location: 'Ratchaburi',
    dateAdded: '14 Aug 2022',
    image: 'https://images.unsplash.com/photo-1598970434795-0c54fe7c0648?q=80&w=2670&auto=format&fit=crop',
    isMarked: true,
    category: 'Market',
    description: 'Traditional boats selling goods on the canal.'
  },
  {
    id: '7',
    name: 'Pattaya Beach',
    location: 'Chon Buri',
    dateAdded: '20 Jul 2022',
    image: 'https://images.unsplash.com/photo-1595246140625-573b715d1128?q=80&w=2536&auto=format&fit=crop',
    isMarked: true,
    category: 'Beach',
    description: 'Vibrant beach city known for its nightlife and watersports.'
  },
  {
    id: '8',
    name: 'Wat Phra That Doi Suthep',
    location: 'Chiang Mai',
    dateAdded: '12 Oct 2023',
    image: 'https://images.unsplash.com/photo-1599553761783-c743825838c3?q=80&w=2574&auto=format&fit=crop',
    isMarked: true,
    category: 'Temple',
    description: 'Golden stupa glistening in the sun. A truly spiritual climb.'
  },
  {
    id: '9',
    name: 'Patong Beach Sunset',
    location: 'Phuket',
    dateAdded: '10 Oct 2023',
    image: 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?q=80&w=2000&auto=format&fit=crop',
    isMarked: true,
    category: 'Beach',
    description: 'Incredible colors over the Andaman Sea.'
  },
  {
    id: '10',
    name: 'Khao Yai National Park',
    location: 'Nakhon Ratchasima',
    dateAdded: '22 Aug 2023',
    image: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=2664&auto=format&fit=crop',
    isMarked: true,
    category: 'Nature',
    description: 'Spotted wild elephants crossing the road!'
  }
];

export const provinces = [
  { id: 'chiang-rai', name: 'Chiang Rai', path: 'M140,50 L160,40 L180,50 L190,80 L160,100 L130,90 Z', visited: true },
  { id: 'chiang-mai', name: 'Chiang Mai', path: 'M100,80 L130,90 L160,100 L150,140 L110,150 L90,120 Z', visited: false },
  { id: 'phayao', name: 'Phayao', path: 'M160,100 L190,80 L210,90 L200,130 L160,140 Z', visited: false },
  { id: 'nan', name: 'Nan', path: 'M190,80 L230,80 L240,110 L210,130 L200,130 L210,90 Z', visited: false },
  { id: 'lampang', name: 'Lampang', path: 'M110,150 L150,140 L160,140 L170,180 L130,190 Z', visited: false },
  { id: 'phrae', name: 'Phrae', path: 'M170,180 L200,130 L210,130 L240,160 L220,200 L180,190 Z', visited: true },
  { id: 'loei', name: 'Loei', path: 'M240,160 L280,150 L300,180 L260,210 L220,200 Z', visited: false },
  { id: 'sukhothai', name: 'Sukhothai', path: 'M130,190 L170,180 L180,190 L180,230 L140,240 Z', visited: false },
  { id: 'phitsanulok', name: 'Phitsanulok', path: 'M180,190 L220,200 L230,240 L190,250 L180,230 Z', visited: true },
  { id: 'udon-thani', name: 'Udon Thani', path: 'M260,210 L300,180 L330,200 L320,250 L270,250 Z', visited: false },
  { id: 'kamphaeng-phet', name: 'Kamphaeng Phet', path: 'M140,240 L180,230 L190,250 L180,290 L150,280 Z', visited: false },
  { id: 'nakhon-sawan', name: 'Nakhon Sawan', path: 'M190,250 L230,240 L240,280 L200,300 L180,290 Z', visited: false },
  { id: 'khon-kaen', name: 'Khon Kaen', path: 'M270,250 L320,250 L340,280 L300,310 L260,290 Z', visited: true },
  { id: 'ubon-ratchathani', name: 'Ubon Ratchathani', path: 'M340,280 L370,270 L380,310 L350,340 L310,320 Z', visited: false },
  { id: 'ayutthaya', name: 'Ayutthaya', path: 'M160,340 L200,330 L210,360 L180,380 L150,370 Z', visited: true },
  { id: 'bangkok', name: 'Bangkok', path: 'M180,380 L210,360 L220,390 L190,400 Z', visited: true },
  { id: 'chonburi', name: 'Chonburi', path: 'M220,390 L260,380 L270,410 L230,420 Z', visited: false },
  { id: 'ratchaburi', name: 'Ratchaburi', path: 'M150,370 L140,410 L160,430 L180,410 Z', visited: false },
  { id: 'prachuap-khiri-khan', name: 'Prachuap Khiri Khan', path: 'M140,410 L130,450 L150,470 L170,450 L160,430 Z', visited: true },
  { id: 'chumphon', name: 'Chumphon', path: 'M130,450 L120,500 L140,510 L150,470 Z', visited: false },
  { id: 'surat-thani', name: 'Surat Thani', path: 'M120,500 L100,530 L130,550 L140,510 Z', visited: true },
  { id: 'krabi', name: 'Krabi', path: 'M100,530 L90,570 L110,590 L130,550 Z', visited: false },
  { id: 'phuket', name: 'Phuket', path: 'M90,570 L80,600 L100,610 L110,590 Z', visited: true },
  { id: 'songkhla', name: 'Songkhla', path: 'M110,590 L130,550 L150,570 L140,610 L120,620 Z', visited: false },
  { id: 'yala', name: 'Yala', path: 'M140,610 L160,630 L130,640 L120,620 Z', visited: false },
];
