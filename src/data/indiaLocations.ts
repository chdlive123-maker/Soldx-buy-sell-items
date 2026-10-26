export interface StateLocationGroup {
  state: string;
  code: string;
  type: 'state' | 'ut';
  cities: string[];
}

export interface FlatIndianCity {
  city: string;
  state: string;
  code: string;
  isPopular?: boolean;
}

export const TOP_POPULAR_CITIES: { city: string; state: string }[] = [
  { city: 'Mumbai', state: 'Maharashtra' },
  { city: 'Delhi', state: 'Delhi (NCT)' },
  { city: 'Bengaluru', state: 'Karnataka' },
  { city: 'Hyderabad', state: 'Telangana' },
  { city: 'Pune', state: 'Maharashtra' },
  { city: 'Chennai', state: 'Tamil Nadu' },
  { city: 'Kolkata', state: 'West Bengal' },
  { city: 'Ahmedabad', state: 'Gujarat' },
  { city: 'Jaipur', state: 'Rajasthan' },
  { city: 'Lucknow', state: 'Uttar Pradesh' },
  { city: 'Chandigarh', state: 'Chandigarh' },
  { city: 'Indore', state: 'Madhya Pradesh' },
  { city: 'Patna', state: 'Bihar' },
  { city: 'Surat', state: 'Gujarat' },
  { city: 'Gurugram', state: 'Haryana' },
  { city: 'Noida', state: 'Uttar Pradesh' },
];

export const INDIA_STATES_AND_CITIES: StateLocationGroup[] = [
  {
    state: 'Andhra Pradesh',
    code: 'AP',
    type: 'state',
    cities: [
      'Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Rajahmundry', 'Tirupati',
      'Kakinada', 'Kadapa', 'Anantapur', 'Eluru', 'Ongole', 'Nandyal', 'Machilipatnam', 'Adoni',
      'Tenali', 'Chittoor', 'Hindupur', 'Proddatur', 'Bhimavaram', 'Srikakulam', 'Vizianagaram',
      'Madanapalle', 'Guntakal', 'Dharmavaram', 'Gudivada', 'Narasaraopet', 'Tadpatri', 'Tadepalligudem',
      'Amalapuram', 'Chilakaluripet', 'Kavali', 'Chirala', 'Anakapalle', 'Sullurpeta', 'Tanuku',
      'Rayachoti', 'Srikalahasti', 'Bapatla', 'Parvathipuram', 'Markapur', 'Puttur', 'Palasa'
    ],
  },
  {
    state: 'Arunachal Pradesh',
    code: 'AR',
    type: 'state',
    cities: [
      'Itanagar', 'Naharlagun', 'Pasighat', 'Tawang', 'Ziro', 'Bomdila', 'Tezu', 'Roing',
      'Aalo (Along)', 'Changlang', 'Khonsa', 'Daporijo', 'Seppa', 'Namsai', 'Yingkiong', 'Anini'
    ],
  },
  {
    state: 'Assam',
    code: 'AS',
    type: 'state',
    cities: [
      'Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Tinsukia', 'Tezpur', 'Bongaigaon',
      'Diphu', 'Dhubri', 'North Lakhimpur', 'Karimganj', 'Sivasagar', 'Goalpara', 'Barpeta',
      'Golaghat', 'Haflong', 'Kokrajhar', 'Hailakandi', 'Mangaldoi', 'Nalbari', 'Morigaon',
      'Hojai', 'Biswanath Chariali', 'Dhemaji', 'Rangia', 'Lumding', 'Digboi', 'Majuli'
    ],
  },
  {
    state: 'Bihar',
    code: 'BR',
    type: 'state',
    cities: [
      'Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 'Darbhanga', 'Bihar Sharif', 'Arrah',
      'Begusarai', 'Katihar', 'Munger', 'Chhapra', 'Danapur', 'Bettiah', 'Saharsa', 'Sasaram',
      'Hajipur', 'Dehri', 'Siwan', 'Motihari', 'Nawada', 'Bagaha', 'Buxar', 'Kishanganj',
      'Sitamarhi', 'Jamalpur', 'Jehanabad', 'Aurangabad (Bihar)', 'Lakhisarai', 'Madhubani',
      'Samastipur', 'Khagaria', 'Gopalganj', 'Supaul', 'Madhepura', 'Araria', 'Banka', 'Jamui',
      'Bhabua', 'Sheikhpura', 'Sheohar', 'Arwal', 'Forbesganj', 'Mokama', 'Raxaul', 'Bodh Gaya'
    ],
  },
  {
    state: 'Chhattisgarh',
    code: 'CG',
    type: 'state',
    cities: [
      'Raipur', 'Bhilai', 'Durg', 'Bilaspur', 'Korba', 'Rajnandgaon', 'Raigarh', 'Jagdalpur',
      'Ambikapur', 'Dhamtari', 'Chirmiri', 'Mahasamund', 'Bhatapara', 'Dalli-Rajhara', 'Kanker',
      'Kawardha', 'Kondagaon', 'Mungeli', 'Janjgir', 'Champa', 'Surajpur', 'Jashpur', 'Dantewada',
      'Bijapur (CG)', 'Sukma', 'Narayanpur', 'Balod', 'Bemetara', 'Baloda Bazar', 'Gariaband', 'Nava Raipur'
    ],
  },
  {
    state: 'Goa',
    code: 'GA',
    type: 'state',
    cities: [
      'Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda', 'Bicholim', 'Curchorem',
      'Canacona', 'Pernem', 'Quepem', 'Sanguem', 'Sanquelim', 'Valpoi', 'Porvorim', 'Calangute'
    ],
  },
  {
    state: 'Gujarat',
    code: 'GJ',
    type: 'state',
    cities: [
      'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Junagadh', 'Gandhinagar',
      'Gandhidham', 'Anand', 'Navsari', 'Morbi', 'Nadiad', 'Surendranagar', 'Bharuch', 'Mehsana',
      'Bhuj', 'Porbandar', 'Palanpur', 'Valsad', 'Vapi', 'Gondal', 'Veraval', 'Godhra', 'Patan',
      'Kalol', 'Dahod', 'Botad', 'Amreli', 'Deesa', 'Jetpur', 'Ankleshwar', 'Himatnagar', 'Modasa',
      'Vyara', 'Ahwa', 'Dwarka', 'Somnath', 'Mundra', 'Halol', 'Sanand', 'Kadi', 'Unjha', 'Visnagar'
    ],
  },
  {
    state: 'Haryana',
    code: 'HR',
    type: 'state',
    cities: [
      'Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Yamunanagar', 'Rohtak', 'Hisar', 'Karnal',
      'Sonipat', 'Panchkula', 'Bhiwani', 'Sirsa', 'Bahadurgarh', 'Jind', 'Kurukshetra', 'Thanesar',
      'Kaithal', 'Rewari', 'Palwal', 'Hansi', 'Narnaul', 'Fatehabad', 'Gohana', 'Tohana', 'Narwana',
      'Charkhi Dadri', 'Nuh', 'Jhajjar', 'Mahendragarh', 'Mandi Dabwali', 'Pehowa', 'Pinjore',
      'Kalka', 'Shahbad', 'Safidon', 'Samalkha', 'Gharaunda', 'Assandh', 'Ellenabad', 'Ratia', 'Sohna', 'Manesar'
    ],
  },
  {
    state: 'Himachal Pradesh',
    code: 'HP',
    type: 'state',
    cities: [
      'Shimla', 'Dharamshala', 'Solan', 'Mandi', 'Palampur', 'Baddi', 'Nahan', 'Paonta Sahib',
      'Sundarnagar', 'Chamba', 'Una', 'Kullu', 'Manali', 'Hamirpur (HP)', 'Bilaspur (HP)', 'Kangra',
      'Reckong Peo', 'Keylong', 'Dalhousie', 'Kasauli', 'Parwanoo', 'Nalagarh', 'Rampur Bushahr', 'Nurpur'
    ],
  },
  {
    state: 'Jharkhand',
    code: 'JH',
    type: 'state',
    cities: [
      'Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro Steel City', 'Deoghar', 'Phusro', 'Hazaribagh',
      'Giridih', 'Ramgarh', 'Medininagar (Daltonganj)', 'Chirkunda', 'Chaibasa', 'Dumka', 'Godda',
      'Gumla', 'Jamtara', 'Khunti', 'Koderma', 'Latehar', 'Lohardaga', 'Pakur', 'Sahibganj',
      'Seraikela', 'Simdega', 'Chatra', 'Garhwa', 'Madhupur', 'Chakradharpur', 'Ghatshila'
    ],
  },
  {
    state: 'Karnataka',
    code: 'KA',
    type: 'state',
    cities: [
      'Bengaluru', 'Mysuru', 'Hubballi', 'Dharwad', 'Mangaluru', 'Belagavi', 'Kalaburagi',
      'Davanagere', 'Ballari', 'Vijayapura', 'Shivamogga', 'Tumakuru', 'Raichur', 'Bidar',
      'Hosapete', 'Gadag-Betageri', 'Hassan', 'Bhadravati', 'Chitradurga', 'Udupi', 'Kolar',
      'Mandya', 'Chikkamagaluru', 'Gangavati', 'Bagalkot', 'Ranebennuru', 'Karwar', 'Madikeri',
      'Chikkaballapur', 'Ramanagara', 'Yadgir', 'Chamarajanagar', 'Koppal', 'Haveri', 'Manipal',
      'Gokak', 'Sirsi', 'Puttur (KA)', 'Bhatkal', 'Dandeli'
    ],
  },
  {
    state: 'Kerala',
    code: 'KL',
    type: 'state',
    cities: [
      'Kochi', 'Thiruvananthapuram', 'Kozhikode', 'Thrissur', 'Kollam', 'Palakkad', 'Alappuzha',
      'Malappuram', 'Kannur', 'Kottayam', 'Kasaragod', 'Pathanamthitta', 'Idukki', 'Kalpetta (Wayanad)',
      'Manjeri', 'Thalassery', 'Ponnani', 'Vatakara', 'Kanhangad', 'Payyanur', 'Koyilandy',
      'Neyyattinkara', 'Kayamkulam', 'Tirur', 'Changanassery', 'Muvattupuzha', 'guruvayur', 'Munnar', 'Aluva'
    ],
  },
  {
    state: 'Madhya Pradesh',
    code: 'MP',
    type: 'state',
    cities: [
      'Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Dewas', 'Satna', 'Ratlam',
      'Rewa', 'Katni (Murwara)', 'Singrauli', 'Burhanpur', 'Khandwa', 'Bhind', 'Chhindwara',
      'Guna', 'Shivpuri', 'Vidisha', 'Chhatarpur', 'Damoh', 'Mandsaur', 'Khargone', 'Neemuch',
      'Pithampur', 'Narmadapuram (Hoshangabad)', 'Itarsi', 'Sehore', 'Morena', 'Betul', 'Seoni',
      'Datia', 'Nagda', 'Dhar', 'Balaghat', 'Shahdol', 'Tikamgarh', 'Mandla', 'Raisen', 'Rajgarh',
      'Shajapur', 'Ashoknagar', 'Anuppur', 'Harda', 'Panna', 'Barwani', 'Alirajpur', 'Jhabua',
      'Sidhi', 'Umaria', 'Dindori', 'Sheopur', 'Maihar', 'Bina'
    ],
  },
  {
    state: 'Maharashtra',
    code: 'MH',
    type: 'state',
    cities: [
      'Mumbai', 'Pune', 'Nagpur', 'Thane', 'Pimpri-Chinchwad', 'Nashik', 'Kalyan-Dombivli',
      'Vasai-Virar', 'Chhatrapati Sambhajinagar (Aurangabad)', 'Navi Mumbai', 'Solapur',
      'Mira-Bhayandar', 'Bhiwandi', 'Amravati', 'Nanded', 'Kolhapur', 'Ulhasnagar', 'Sangli',
      'Malegaon', 'Jalgaon', 'Akola', 'Latur', 'Dhule', 'Ahilyanagar (Ahmednagar)', 'Chandrapur',
      'Parbhani', 'Ichalkaranji', 'Jalna', 'Ambarnath', 'Bhusawal', 'Panvel', 'Badlapur', 'Beed',
      'Gondia', 'Satara', 'Barshi', 'Yavatmal', 'Achalpur', 'Dharashiv (Osmanabad)', 'Nandurbar',
      'Wardha', 'Udgir', 'Hinganghat', 'Ratnagiri', 'Alibag', 'Sindhudurg', 'Buldhana', 'Washim',
      'Hingoli', 'Gadchiroli', 'Bhandara', 'Palghar', 'Baramati', 'Karad', 'Lonavala', 'Shirdi'
    ],
  },
  {
    state: 'Manipur',
    code: 'MN',
    type: 'state',
    cities: [
      'Imphal', 'Thoubal', 'Bishnupur', 'Churachandpur', 'Kakching', 'Ukhrul', 'Senapati',
      'Tamenglong', 'Chandel', 'Jiribam', 'Moreh'
    ],
  },
  {
    state: 'Meghalaya',
    code: 'ML',
    type: 'state',
    cities: [
      'Shillong', 'Tura', 'Jowai', 'Nongpoh', 'Nongstoin', 'Williamnagar', 'Baghmara',
      'Cherrapunji (Sohra)', 'Resubelpara', 'Mairang'
    ],
  },
  {
    state: 'Mizoram',
    code: 'MZ',
    type: 'state',
    cities: [
      'Aizawl', 'Lunglei', 'Saiha', 'Champhai', 'Kolasib', 'Serchhip', 'Lawngtlai', 'Mamit'
    ],
  },
  {
    state: 'Nagaland',
    code: 'NL',
    type: 'state',
    cities: [
      'Dimapur', 'Kohima', 'Mokokchung', 'Tuensang', 'Wokha', 'Zunheboto', 'Mon', 'Phek',
      'Kiphire', 'Longleng', 'Peren', 'Chumoukedima'
    ],
  },
  {
    state: 'Odisha',
    code: 'OD',
    type: 'state',
    cities: [
      'Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur', 'Puri', 'Balasore',
      'Bhadrak', 'Baripada', 'Jharsuguda', 'Jeypore', 'Barbil', 'Khordha', 'Balangir', 'Rayagada',
      'Bhawanipatna', 'Dhenkanal', 'Kendujhar', 'Paradip', 'Angul', 'Bargarh', 'Jagatsinghpur',
      'Jajpur', 'Kendrapara', 'Koraput', 'Malkangiri', 'Nabarangpur', 'Nayagarh', 'Nuapada',
      'Phulbani', 'Sonepur', 'Sundargarh', 'Talcher'
    ],
  },
  {
    state: 'Punjab',
    code: 'PB',
    type: 'state',
    cities: [
      'Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali (SAS Nagar)', 'Pathankot',
      'Hoshiarpur', 'Batala', 'Moga', 'Malerkotla', 'Khanna', 'Phagwara', 'Muktsar', 'Barnala',
      'Rajpura', 'Firozpur', 'Kapurthala', 'Faridkot', 'Sangrur', 'Gurdaspur', 'Fazilka', 'Mansa',
      'Rupnagar (Ropar)', 'Tarn Taran', 'Nawanshahr (SBS Nagar)', 'Fatehgarh Sahib', 'Abohar',
      'Zirakpur', 'Kharar', 'Derabassi', 'Nabha', 'Mandi Gobindgarh', 'Kotkapura', 'Sunam', 'Jagraon'
    ],
  },
  {
    state: 'Rajasthan',
    code: 'RJ',
    type: 'state',
    cities: [
      'Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Ajmer', 'Udaipur', 'Bhilwara', 'Alwar', 'Bharatpur',
      'Sikar', 'Pali', 'Sri Ganganagar', 'Kishangarh', 'Baran', 'Dholpur', 'Tonk', 'Beawar',
      'Hanumangarh', 'Gangapur City', 'Sawai Madhopur', 'Chittorgarh', 'Jhunjhunu', 'Churu',
      'Nagaur', 'Barmer', 'Jaisalmer', 'Jhalawar', 'Banswara', 'Bundi', 'Dungarpur', 'Jalore',
      'Karauli', 'Pratapgarh (RJ)', 'Rajsamand', 'Sirohi', 'Mount Abu', 'Bhiwadi', 'Neemrana',
      'Makrana', 'Sujangarh', 'Balotra', 'kotputli', 'Phalodi', 'Didwana', 'Nohar', 'Suratgarh'
    ],
  },
  {
    state: 'Sikkim',
    code: 'SK',
    type: 'state',
    cities: [
      'Gangtok', 'Namchi', 'Gyalshing', 'Mangan', 'Rangpo', 'Singtam', 'Jorethang', 'Pakyong'
    ],
  },
  {
    state: 'Tamil Nadu',
    code: 'TN',
    type: 'state',
    cities: [
      'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Tiruppur',
      'Vellore', 'Erode', 'Thoothukudi', 'Dindigul', 'Thanjavur', 'Ranipet', 'Sivakasi', 'Karur',
      'Ooty (Udhagamandalam)', 'Hosur', 'Nagercoil', 'Kanchipuram', 'Karaikkudi', 'Neyveli',
      'Cuddalore', 'Kumbakonam', 'Tiruvannamalai', 'Pollachi', 'Rajapalayam', 'Pudukkottai',
      'Vaniyambadi', 'Ambur', 'Nagapattinam', 'Villupuram', 'Namakkal', 'Dharmapuri', 'Krishnagiri',
      'Virudhunagar', 'Ramanathapuram', 'Theni', 'Chengalpattu', 'Tambaram', 'Avadi', 'Tenkasi', 'Mayiladuthurai'
    ],
  },
  {
    state: 'Telangana',
    code: 'TS',
    type: 'state',
    cities: [
      'Hyderabad', 'Secunderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam', 'Ramagundam',
      'Mahabubnagar', 'Nalgonda', 'Adilabad', 'Suryapet', 'Miryalaguda', 'Siddipet', 'Jagtial',
      'Mancherial', 'Kamareddy', 'Kothagudem', 'Bodhan', 'Sangareddy', 'Vikarabad', 'Medak',
      'Zaheerabad', 'Bhongir', 'Wanaparthy', 'Gadwal', 'Nagarkurnool', 'Nirmal'
    ],
  },
  {
    state: 'Tripura',
    code: 'TR',
    type: 'state',
    cities: [
      'Agartala', 'Udaipur (Tripura)', 'Dharmanagar', 'Kailasahar', 'Belonia', 'Khowai', 'Ambassa', 'Sabroom'
    ],
  },
  {
    state: 'Uttar Pradesh',
    code: 'UP',
    type: 'state',
    cities: [
      'Lucknow', 'Noida', 'Greater Noida', 'Ghaziabad', 'Kanpur', 'Agra', 'Varanasi', 'Meerut',
      'Prayagraj (Allahabad)', 'Bareilly', 'Aligarh', 'Moradabad', 'Saharanpur', 'Gorakhpur',
      'Firozabad', 'Jhansi', 'Muzaffarnagar', 'Mathura', 'Vrindavan', 'Ayodhya', 'Rampur',
      'Shahjahanpur', 'Farrukhabad', 'Mau', 'Hapur', 'Etawah', 'Mirzapur', 'Bulandshahr',
      'Sambhal', 'Amroha', 'Hardoi', 'Fatehpur', 'Raebareli', 'Orai', 'Sitapur', 'Bahraich',
      'Modinagar', 'Unnao', 'Jaunpur', 'Lakhimpur Kheri', 'Hathras', 'Banda', 'Pilibhit',
      'Barabanki', 'Khurja', 'Gonda', 'Mainpuri', 'Lalitpur', 'Etah', 'Deoria', 'Ghazipur',
      'Sultanpur', 'Azamgarh', 'Bijnor', 'Basti', 'Chandausi', 'Akbarpur', 'Ballia', 'Shamli',
      'Kasganj', 'Auraiya', 'Bhadohi', 'Baghpat', 'Balrampur', 'Chandauli', 'Chitrakoot',
      'Kannauj', 'Kushinagar', 'Maharajganj', 'Mahoba', 'Pratapgarh (UP)', 'Sonbhadra', 'Renukoot'
    ],
  },
  {
    state: 'Uttarakhand',
    code: 'UK',
    type: 'state',
    cities: [
      'Dehradun', 'Haridwar', 'Roorkee', 'Haldwani', 'Rudrapur', 'Kashipur', 'Rishikesh',
      'Nainital', 'Mussoorie', 'Pithoragarh', 'Pauri', 'Tehri', 'Almora', 'Bageshwar', 'Champawat',
      'Gopeshwar (Chamoli)', 'Uttarkashi', 'Rudraprayag', 'Kotdwar', 'Ramnagar', 'Ranikhet', 'Khatima'
    ],
  },
  {
    state: 'West Bengal',
    code: 'WB',
    type: 'state',
    cities: [
      'Kolkata', 'Howrah', 'Siliguri', 'Durgapur', 'Asansol', 'Bardhaman', 'Malda', 'Baharampur',
      'Habra', 'Kharagpur', 'Haldia', 'Raiganj', 'Krishnanagar', 'Nabadwip', 'Medinipur',
      'Jalpaiguri', 'Balurghat', 'Basirhat', 'Bankura', 'Darjeeling', 'Alipurduar', 'Purulia',
      'Cooch Behar', 'Kalimpong', 'Suri', 'Bolpur (Santiniketan)', 'Tamluk', 'Contai', 'Bongaon',
      'Kalyani', 'Barrackpore', 'Barasat', 'Chinsurah', 'Serampore', 'Salt Lake'
    ],
  },
  // 8 UNION TERRITORIES
  {
    state: 'Delhi (NCT)',
    code: 'DL',
    type: 'ut',
    cities: [
      'Delhi', 'New Delhi', 'South Delhi', 'North Delhi', 'East Delhi', 'West Delhi', 'Central Delhi',
      'Dwarka', 'Rohini', 'Saket', 'Connaught Place', 'Janakpuri', 'Lajpat Nagar', 'Karol Bagh',
      'Pitampura', 'Vasant Kunj', 'Laxmi Nagar', 'Shahdara', 'Okhla', 'Najafgarh', 'Narela', 'Nehru Place'
    ],
  },
  {
    state: 'Chandigarh',
    code: 'CH',
    type: 'ut',
    cities: [
      'Chandigarh', 'Manimajra', 'Sector 17 Chandigarh', 'Sector 22 Chandigarh', 'Sector 35 Chandigarh'
    ],
  },
  {
    state: 'Jammu & Kashmir',
    code: 'JK',
    type: 'ut',
    cities: [
      'Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Sopore', 'Kathua', 'Udhampur', 'Rajouri',
      'Poonch', 'Pulwama', 'Kupwara', 'Budgam', 'Ganderbal', 'Bandipora', 'Kulgam', 'Shopian',
      'Samba', 'Reasi', 'Ramban', 'Doda', 'Kishtwar', 'Katra', 'Pahalgam', 'Gulmarg'
    ],
  },
  {
    state: 'Ladakh',
    code: 'LA',
    type: 'ut',
    cities: ['Leh', 'Kargil', 'Diskit (Nubra)', 'Padum (Zanskar)', 'Drass'],
  },
  {
    state: 'Puducherry',
    code: 'PY',
    type: 'ut',
    cities: ['Puducherry', 'Oulgaret', 'Karaikal', 'Mahe', 'Yanam'],
  },
  {
    state: 'Andaman & Nicobar Islands',
    code: 'AN',
    type: 'ut',
    cities: ['Port Blair (Sri Vijaya Puram)', 'Diglipur', 'Rangat', 'Mayabunder', 'Car Nicobar', 'Swaraj Dweep (Havelock)'],
  },
  {
    state: 'Dadra & Nagar Haveli and Daman & Diu',
    code: 'DD',
    type: 'ut',
    cities: ['Silvassa', 'Daman', 'Diu'],
  },
  {
    state: 'Lakshadweep',
    code: 'LD',
    type: 'ut',
    cities: ['Kavaratti', 'Agatti', 'Minicoy', 'Amini', 'Andrott'],
  },
];

const popularSet = new Set(TOP_POPULAR_CITIES.map(c => c.city.toLowerCase()));

export const ALL_INDIA_CITIES: FlatIndianCity[] = INDIA_STATES_AND_CITIES.flatMap(group =>
  group.cities.map(rawCity => {
    const cleanCity = rawCity.charAt(0).toUpperCase() + rawCity.slice(1);
    return {
      city: cleanCity,
      state: group.state,
      code: group.code,
      isPopular: popularSet.has(cleanCity.toLowerCase()),
    };
  })
);

export function getStateForCity(cityName: string): string | undefined {
  if (!cityName || cityName === 'All India') return undefined;
  const lower = cityName.trim().toLowerCase();
  const exact = ALL_INDIA_CITIES.find(
    c => c.city.toLowerCase() === lower || c.city.toLowerCase().split(' (')[0] === lower
  );
  if (exact) return exact.state;
  if (lower === 'delhi ncr') return 'Delhi (NCT)';
  return undefined;
}

export function getCitiesByState(stateName: string): string[] {
  const group = INDIA_STATES_AND_CITIES.find(
    g => g.state.toLowerCase() === stateName.trim().toLowerCase()
  );
  return group ? group.cities.map(c => c.charAt(0).toUpperCase() + c.slice(1)) : [];
}

export function searchIndiaLocations(query: string, limit = 60): {
  matchingStates: StateLocationGroup[];
  matchingCities: FlatIndianCity[];
} {
  const q = query.trim().toLowerCase();
  if (!q) {
    return { matchingStates: [], matchingCities: [] };
  }

  const matchingStates = INDIA_STATES_AND_CITIES.filter(
    s => s.state.toLowerCase().includes(q) || s.code.toLowerCase() === q
  );

  const prefixCities: FlatIndianCity[] = [];
  const containsCities: FlatIndianCity[] = [];

  for (const item of ALL_INDIA_CITIES) {
    const cityLower = item.city.toLowerCase();
    const stateLower = item.state.toLowerCase();
    if (cityLower.startsWith(q)) {
      prefixCities.push(item);
    } else if (cityLower.includes(q) || stateLower.startsWith(q)) {
      containsCities.push(item);
    }
  }

  return {
    matchingStates: matchingStates.slice(0, 6),
    matchingCities: [...prefixCities, ...containsCities].slice(0, limit),
  };
}

export async function detectCurrentIndianCity(): Promise<{
  city: string;
  state: string;
  area?: string;
}> {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    throw new Error('GPS Geolocation aapke browser me supported nahi hai.');
  }

  const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000,
    });
  });

  const { latitude, longitude } = pos.coords;
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14&addressdetails=1`,
    {
      headers: {
        'Accept-Language': 'en',
      },
    }
  );

  if (!res.ok) {
    throw new Error('Location reverse lookup failed.');
  }

  const data = await res.json();
  const addr = data?.address || {};
  const detectedCity =
    addr.city ||
    addr.town ||
    addr.city_district ||
    addr.county ||
    addr.state_district ||
    addr.village ||
    'Delhi';
  const detectedState = addr.state || getStateForCity(detectedCity) || 'India';
  const detectedArea = addr.suburb || addr.neighbourhood || addr.residential || addr.village || '';

  return {
    city: detectedCity,
    state: detectedState,
    area: detectedArea,
  };
}
