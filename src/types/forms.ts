export type SampleRow = {
  id: string;
  drillNum: string;
  sampleNum: string;
  depth: string;
  time: string;
  soilType: string[];
  color: string[];
  smell: string;
  moisture: string;
  pid: string;
  pid20: string;
  notes: string;
  sendToLab: boolean;
  labChoice: string; // "מעבדה ראשית" | "מעבדה משנית" | ""
  samplingTool: string;
  numContainers: string;
  sampleType: string; // ח/מ
  tests: string[];
};

export type ProjectDetails = {
  id: string;
  name: string;
  address: string;
  client: string;
  groundwaterLevel: string;
  reportApprover: string;
  landUse: string;
  showIsracLogo: boolean;
  createdAt: string;
  createdBy: string;
};

export type FieldJournalData = {
  site: string;
  address: string;
  date: string;
  readinessCheck: string;
  drillingTool: string;
  arrivalTime: string;
  tempStart: string;
  endTime: string;
  tempEnd: string;
  sampler1: string;
  sampler2: string;
  client: string;
  clientRep: string;
  pid: string;
  pidOpenAir: string;
  weather: string[];
  labCalibValid: string;
  dailyCalib: string;
  coldStorage: string;
  samples: SampleRow[];
  signature: string;
  // From project details
  groundwaterLevel: string;
  reportApprover: string;
  landUse: string;
  showIsracLogo: boolean;
  locationITM_E: string;
  locationITM_N: string;
  // End time required
  endTimeRequired: boolean;
};

export type ChainOfCustodyData = {
  site: string;
  date: string;
  lab: string;
  billedTo: string;
  address: string;
  weather: string[];
  landUse: string;
  groundwaterLevel: string;
  pid: string;
  samplerName: string;
  reportApprover: string;
  clientName: string;
  contactPerson: string;
  drilledBySubcontractor: string;
  sampledBySubcontractor: string;
  deviations: string;
  tests: string[];
  storageLocation: string;
  storageManager: string;
  storageStartDate: string;
  storageStartTime: string;
  storageEndDate: string;
  storageEndTime: string;
  storageCondition: string;
  deliveredBy: string;
  deliveryDate: string;
  deliveryTime: string;
  receivedBy: string;
  receivedDate: string;
  receivedTime: string;
  signature: string;
  samples: SampleRow[];
  showIsracLogo: boolean;
  locationITM_E: string;
  locationITM_N: string;
  // Checkboxes from form
  checkSamplingDone: boolean;
  checkNoReplace: boolean;
  checkDeviations: boolean;
};

export const SOIL_TYPES = ["חרסית", "חרסית שמנה", "חמרה", "לס", "כורכר", "חול", "מצעים", "אחר"];
export const COLORS = ["חום", "שחור", "אדום", "אפור", "לבן", "צהוב", "כתום", "אחר"];
export const MOISTURE = ["יבש", "לח", "רטוב"];
export const SMELL = ["אין", "קל", "חזק"];
export const WEATHER = ["שמשי", "מעונן חלקי", "מעונן", "גשום", "חם", "חם מאוד"];
export const DRILLING_TOOLS = ["דחיקה ישירה", "ספירלה", "פקפק", "מקדח הולנדי", "כף חפירה", "ידני"];
export const SAMPLING_TOOLS = ["צנצנת זכוכית", "לינר", "Zip-Lock", "קופסת פח"];
export const SAMPLE_TYPES = ["ח", "מ"];
export const LAB_TESTS = ["TPH D+O", "ICP מתכות", "PFAS", "CR+6", "PH", "SVOC", "VOC", "TPH GRO"];
export const PID_OPTIONS = ["XT-103253", "XT-103411", "XT-100270", "T-118415", "07-0127", "אחר"];
