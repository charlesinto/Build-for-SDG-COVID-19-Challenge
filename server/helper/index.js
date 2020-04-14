import fs from 'fs';
import path from 'path';

const getTheNumberFactorSets = (periodType, timeToElapse) => {
  switch (periodType.trim().toLowerCase()) {
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
  return Math.trunc(result);
};

const calculateDollarsInFlight = (infectionsRequestedByTime, timeToElapse,
  avgDailyIncomeInUSD, avgDailyIncomePopulation, periodType) => {
  const infections = infectionsRequestedByTime * avgDailyIncomeInUSD * avgDailyIncomePopulation;
  let calculatedTimeToElapse;
  switch (periodType.trim().toLowerCase()) {
    case 'days':
      calculatedTimeToElapse = timeToElapse;
      break;
    case 'weeks':
      calculatedTimeToElapse = timeToElapse * 7;
      break;
    case 'months':
      calculatedTimeToElapse = timeToElapse * 30;
      break;
    default:
      return -1;
  }
  return Math.trunc(infections / calculatedTimeToElapse);
};

const covid19ImpactEstimator = (input) => {
  const {
    reportedCases, periodType, timeToElapse, totalHospitalBeds,
    region: { avgDailyIncomeInUSD, avgDailyIncomePopulation }
  } = input;
  const output = { impact: {}, severeImpact: {} };
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
  output.impact.severeCasesByRequestedTime = 0.15
          * output.impact.infectionsByRequestedTime;
  output.severeImpact.severeCasesByRequestedTime = 0.15
          * output.severeImpact.infectionsByRequestedTime;
  output.impact.casesForICUByRequestedTime = Math.trunc(0.05
          * output.impact.infectionsByRequestedTime);

  output.severeImpact.casesForICUByRequestedTime = Math.trunc(0.05
          * output.severeImpact.infectionsByRequestedTime);
  const availableBedSpaces = 0.35 * totalHospitalBeds;
  output.impact.hospitalBedsByRequestedTime = calculateHospitalRequestByTime(
    availableBedSpaces, output.impact.severeCasesByRequestedTime
  );
  output.severeImpact.hospitalBedsByRequestedTime = calculateHospitalRequestByTime(
    availableBedSpaces, output.severeImpact.severeCasesByRequestedTime
  );
  output.severeImpact.casesForVentilatorsByRequestedTime = Math.trunc(0.02
          * output.severeImpact.infectionsByRequestedTime);
  output.impact.casesForVentilatorsByRequestedTime = Math.trunc(0.02
          * output.impact.infectionsByRequestedTime);
  output.impact.dollarsInFlight = calculateDollarsInFlight(output.impact.infectionsByRequestedTime,
    timeToElapse, avgDailyIncomeInUSD, avgDailyIncomePopulation, periodType);
  output.severeImpact.dollarsInFlight = calculateDollarsInFlight(
    output.severeImpact.infectionsByRequestedTime, timeToElapse,
    avgDailyIncomeInUSD, avgDailyIncomePopulation, periodType
  );
  return {
    data: input,
    impact: output.impact,
    severeImpact: output.severeImpact
  };
};

const writeToFile = (data) => (
  new Promise((resolve, reject) => {
    // fs.unlinkSync(path.join(__dirname, '../log/logs.txt'));
    try {
      data.forEach((entry) => {
        fs.appendFileSync(path.join(__dirname, '../logs.txt'), `${entry.method} ${entry.url} ${entry.status} \n`);
      });
      resolve('logs.txt');
    } catch (error) {
      reject(error);
    }
  })
);


module.exports = {
  covid19ImpactEstimator,
  writeToFile
};
