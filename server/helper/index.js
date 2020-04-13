import fs from 'fs';
import path from 'path';

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

const covid19ImpactEstimator = (input) => {
  const output = {impact: {},severeImpact: {} };
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
  output.impact.hospitalBedsByRequestedTime = availableBedSpaces;
  output.severeImpact.hospitalBedsByRequestedTime = availableBedSpaces;

  output.severeImpact.casesForVentilatorsByRequestedTime = Math.floor(0.02
          * output.severeImpact.infectionsByRequestedTime);
  output.impact.casesForVentilatorsByRequestedTime = Math.floor(0.02
          * output.impact.infectionsByRequestedTime);

  output.impact.dollarsInFlight = Math.floor((output.impact.infectionsByRequestedTime
          * 0.65 * avgDailyIncomeInUSD) / 30);

  output.severeImpact.dollarsInFlight = Math.floor((output.severeImpact.infectionsByRequestedTime
          * 0.65 * avgDailyIncomeInUSD) / 30);

  return {
    input,
    impact: output.impact,
    severeImpact: output.severeImpact,
    hospitalBedsByRequestedTime: availableBedSpaces
  };
};

const writeToFile = (data) => {
  return new Promise((resolve, reject) => {
    // fs.unlinkSync(path.join(__dirname, '../log/logs.txt'));
    try {
      data.forEach((entry) => {
        fs.appendFileSync(path.join(__dirname, '../logs.txt'), `${entry.method} ${entry.url} ${entry.status} \n`);
      });
      resolve('logs.txt');
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  covid19ImpactEstimator,
  writeToFile
};
