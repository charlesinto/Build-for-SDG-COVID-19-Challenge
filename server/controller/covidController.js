import path from 'path';
import js2xmlparser from 'js2xmlparser';
import { covid19ImpactEstimator, writeToFile } from '../helper';
import { logs } from '../constants';

const convertToXml = (output) => {
  const obj = {
    'data': {
      '@': {
        'type': 'data'
      },
      'region': {
        '@': {
          'type': 'region'
        },
        'name': output.data.region.name,
        'avgAge': output.data.region.avgAge,
        'avgDailyIncomeInUSD': output.data.region.avgDailyIncomeInUSD,
        'avgDailyIncomePopulation': output.data.region.avgDailyIncomePopulation
      },
      'periodType': output.data.periodType,
      'timeToElapse': output.data.timeToElapse,
      'reportedCases': output.data.reportedCases,
      'population': output.data.population,
      'totalHospitalBeds': output.data.totalHospitalBeds
    },
    'impact': {
      '@': {
        'type': 'Impact'
      },
      'currentlyInfected': output.impact.currentlyInfected,
      'infectionsByRequestedTime': output.impact.infectionsByRequestedTime,
      'severeCasesByRequestedTime': output.impact.severeCasesByRequestedTime,
      'casesForICUByRequestedTime': output.impact.casesForICUByRequestedTime,
      'hospitalBedsByRequestedTime': output.impact.hospitalBedsByRequestedTime,
      'casesForVentilatorsByRequestedTime': output.impact.casesForVentilatorsByRequestedTime,
      'dollarsInFlight': output.impact.dollarsInFlight
    },
    'severeImpact': {
      '@': {
        'type': 'Severe Impact'
      },
      'currentlyInfected': output.severeImpact.currentlyInfected,
      'infectionsByRequestedTime': output.severeImpact.infectionsByRequestedTime,
      'severeCasesByRequestedTime': output.severeImpact.severeCasesByRequestedTime,
      'casesForICUByRequestedTime': output.severeImpact.casesForVentilatorsByRequestedTime,
      'hospitalBedsByRequestedTime': output.severeImpact.hospitalBedsByRequestedTime,
      'casesForVentilatorsByRequestedTime': output.severeImpact.casesForVentilatorsByRequestedTime,
      'dollarsInFlight': output.severeImpact.dollarsInFlight
    },
    'hospitalBedsByRequestedTime': output.hospitalBedsByRequestedTime
  };
  return obj;
};

const calculateImpact = (req, res) => {
  const start = process.hrtime();
  const {
    region: {
      name, avgAge, avgDailyIncomeInUSD, avgDailyIncomePopulation
    }, periodType, timeToElapse, reportedCases, population, totalHospitalBeds } = req.body;
  try {
    if (!(name && name.trim() !== '') || !(avgAge)
      || !(avgDailyIncomeInUSD)
      || !(avgDailyIncomePopulation)
      || !(periodType && periodType.trim() !== '')
      || !(timeToElapse)
      || !(reportedCases)
      || !(population)
      || !(totalHospitalBeds)) {
      const end = process.hrtime(start);
      const timeInMs = (end[0] * 1000000000 + end[1]) / 1000000;
      logs.push({
        method: req.method, url: `${req.baseUrl}/${req.params.format}`, status: 400, time: timeInMs
      });
      writeToFile(logs);
      return res.status(400).send({ message: 'Bad or incomplete request' });
    }
    const output = covid19ImpactEstimator(req.body);
    // logs.push({ method: req.method, url: req.baseUrl, status: 200 });
    if (req.params.format === 'xml') {
      const fromJsToXml = js2xmlparser.parse('output', convertToXml(output));
      const end = process.hrtime(start);
      const timeInMs = (end[0] * 1000000000 + end[1]) / 1000000;
      logs.push({
        method: req.method, url: `${req.baseUrl}/xml`, status: 200, time: timeInMs
      });
      writeToFile(logs);
      return res.set('Content-Type', 'application/xml').status(200)
        .send(fromJsToXml);
    }
    const end = process.hrtime(start);
    const timeInMs = (end[0] * 1000000000 + end[1]) / 1000000;
    logs.push({
      method: req.method, url: `${req.baseUrl}/json`, status: 200, time: timeInMs
    });
    writeToFile(logs);
    return res.status(200).send({ ...output });
  } catch (error) {
    logs.push({ method: req.method, url: `${req.baseUrl}/json`, status: 500 });
    writeToFile(logs);
    return res.status(500).send({ error });
  }
};

const getLogs = async (req, res) => {
  const start = process.hrtime();
  const end = process.hrtime(start);
  const timeInMs = (end[0] * 1000000000 + end[1]) / 1000000;
  logs.push({
    method: req.method, url: `${req.baseUrl}/logs`, status: 200, time: timeInMs
  });
  const file = await writeToFile(logs);
  return res.set('Content-Type', 'text/plain').status(200).sendFile(path.join(__dirname, `../${file}`));
};


module.exports = {
  calculateImpact,
  getLogs
};
