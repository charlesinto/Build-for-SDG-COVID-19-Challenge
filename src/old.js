const data = {
  region: {
    name: 'Africa',
    avgAge: 19.7,
    avgDailyIncomeInUSD: 5,
    avgDailyIncomePopulation: 0.71
  },
  periodType: 'days',
  timeToElapse: 58,
  reportedCases: 674,
  population: 66622705,
  totalHospitalBeds: 1380614
};

const output = {
  data: {},
  impact: {}, // your best case estimation
  severeImpact: {}
};

const getTheNumberFactorSets = (periodType, timeToElapse) => {
  switch (periodType) {
    case 'days':
      return Math.floor(timeToElapse / 3);
    case 'weeks':
      return Math.floor((timeToElapse * 7) / 3);
    case 'months':
      return Math.floor((timeToElapse * 30) / 3);
    default:
      return -1;
  }
};

const calculateHospitalRequestByTime = (availableBedSpaces, severeInfection) => {
  const shortage = availableBedSpaces - severeInfection;
  const result = shortage < 0 ? shortage : availableBedSpaces;
  return Math.floor(result);
};

const covid19ImpactEstimator = (input) => {
  const {
    reportedCases, periodType, timeToElapse, totalHospitalBeds,
    region: { avgDailyIncomeInUSD }
  } = input;
  const currentlyInfected = reportedCases * 10;
  output.impact.currentlyInfected = currentlyInfected;
  output.severeImpact.currentlyInfected = reportedCases * 50;
  const factor = getTheNumberFactorSets(periodType, timeToElapse);

  const infectionsByRequestedTimeImpact = output.impact.currentlyInfected
    * 2 ** factor;
  const infectionsByRequestedTimeSevere = output.severeImpact.currentlyInfected
    * 2 ** factor;
  output.impact.infectionsByRequestedTime = infectionsByRequestedTimeImpact;

  output.severeImpact.infectionsByRequestedTime = infectionsByRequestedTimeSevere;

  output.impact.severeCasesByRequestedTime = Math.floor(0.15
        * output.impact.infectionsByRequestedTime);
  output.severeImpact.severeCasesByRequestedTime = Math.floor(0.15
        * output.severeImpact.infectionsByRequestedTime);

  output.impact.casesForICUByRequestedTime = Math.floor(0.05
        * output.impact.infectionsByRequestedTime);
  output.severeImpact.casesForICUByRequestedTime = Math.floor(0.05
        * output.severeImpact.infectionsByRequestedTime);

  const availableBedSpaces = Math.floor(0.35 * totalHospitalBeds);
  output.impact.hospitalBedsByRequestedTime = calculateHospitalRequestByTime(
    availableBedSpaces, output.impact.severeCasesByRequestedTime
  );
  output.severeImpact.hospitalBedsByRequestedTime = calculateHospitalRequestByTime(
    availableBedSpaces, output.severeImpact.severeCasesByRequestedTime
  );

  output.severeImpact.casesForVentilatorsByRequestedTime = Math.floor(0.02
        * output.severeImpact.infectionsByRequestedTime);
  output.impact.casesForVentilatorsByRequestedTime = Math.floor(0.02
        * output.impact.infectionsByRequestedTime);

  output.impact.dollarsInFlight = Math.floor((output.impact.infectionsByRequestedTime
        * 0.65 * avgDailyIncomeInUSD) / 30);

  output.severeImpact.dollarsInFlight = Math.floor((output.severeImpact.infectionsByRequestedTime
        * 0.65 * avgDailyIncomeInUSD) / 30);

  return {
    data,
    impact: output.impact,
    severeImpact: output.severeImpact
  };
};
// console.log(covid19ImpactEstimator(data));
// ''.toLowerCase

export default covid19ImpactEstimator;
