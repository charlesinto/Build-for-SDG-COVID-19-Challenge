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
  impact: {},
  severeImpact: {}
};

const getTheNumberFactorSets = (periodType, timeToElapse) => {
  switch (periodType.trim().toLowerCase()) {
    case 'days':
      return Math.trunc(timeToElapse / 3);
    case 'weeks':
      return Math.trunc((timeToElapse * 7) / 3);
    case 'months':
      return Math.trunc((timeToElapse * 30) / 3);
    default:
      return -1;
  }
};

const calculateHospitalRequestByTime = (availableBedSpaces, severeInfection) => {
  const shortage = availableBedSpaces - severeInfection;
  const result = shortage < 0 ? shortage : availableBedSpaces;
  return Math.trunc(result);
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
  output.impact.severeCasesByRequestedTime = Math.trunc(0.15
          * output.impact.infectionsByRequestedTime);
  output.severeImpact.severeCasesByRequestedTime = Math.trunc(0.15
          * output.severeImpact.infectionsByRequestedTime);
  output.impact.casesForICUByRequestedTime = Math.trunc(0.05
          * output.impact.infectionsByRequestedTime);
  output.severeImpact.casesForICUByRequestedTime = Math.trunc(0.05
          * output.severeImpact.infectionsByRequestedTime);
  const availableBedSpaces = Math.trunc(0.35 * totalHospitalBeds);
  output.impact.hospitalBedsByRequestedTime = calculateHospitalRequestByTime(
    availableBedSpaces, output.impact.severeCasesByRequestedTime
  );
  console.log('Impact: ', output.impact.hospitalBedsByRequestedTime);
  output.severeImpact.hospitalBedsByRequestedTime = calculateHospitalRequestByTime(
    availableBedSpaces, output.severeImpact.severeCasesByRequestedTime
  );
  console.log('Severe: ', output.severeImpact.hospitalBedsByRequestedTime);
  output.severeImpact.casesForVentilatorsByRequestedTime = Math.trunc(0.02
          * output.severeImpact.infectionsByRequestedTime);
  output.impact.casesForVentilatorsByRequestedTime = Math.trunc(0.02
          * output.impact.infectionsByRequestedTime);
  output.impact.dollarsInFlight = Math.trunc((output.impact.infectionsByRequestedTime
          * 0.65 * avgDailyIncomeInUSD) / 30);
  output.severeImpact.dollarsInFlight = Math.trunc((output.severeImpact.infectionsByRequestedTime
          * 0.65 * avgDailyIncomeInUSD) / 30);
  return {
    data,
    impact: output.impact,
    severeImpact: output.severeImpact
  };
};
//   console.log(covid19ImpactEstimator(data));

export default covid19ImpactEstimator;
