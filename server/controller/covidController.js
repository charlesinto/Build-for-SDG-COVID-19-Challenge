import path from 'path';
import js2xmlparser from 'js2xmlparser';
import { covid19ImpactEstimator, writeToFile } from '../helper';
import { logs } from '../constants';

const convertToXml = (output) => {
  const obj = {
    input: {
      "@": {
        type: 'input'
      },
      region: {
        "@": {
          type: 'region',
        },
        "name": output.input.region.name,
        "avgAge": output.input.region.avgAge,
        "avgDailyIncomeInUSD": output.input.region.avgDailyIncomeInUSD,
        "avgDailyIncomePopulation": output.input.region.avgDailyIncomePopulation
      },
      "periodType": output.input.periodType,
      "timeToElapse": output.input.timeToElapse,
      "reportedCases": output.input.reportedCases,
      "population": output.input.population,
      "totalHospitalBeds": output.input.totalHospitalBeds
    },
    impact: {
      "@": {
        type: 'Impact',
      },
      "currentlyInfected": output.impact.currentlyInfected,
        "infectionsByRequestedTime": output.impact.infectionsByRequestedTime,
        "severeCasesByRequestedTime": output.impact.severeCasesByRequestedTime,
        "casesForICUByRequestedTime": output.impact.casesForICUByRequestedTime,
        "hospitalBedsByRequestedTime": output.impact.hospitalBedsByRequestedTime,
        "casesForVentilatorsByRequestedTime": output.impact.casesForVentilatorsByRequestedTime,
        "dollarsInFlight": output.impact.dollarsInFlight
    },
    severeImpact: {
      "@": {
        type: 'Severe Impact',
      },
      "currentlyInfected": output.severeImpact.currentlyInfected,
      "infectionsByRequestedTime": output.severeImpact.infectionsByRequestedTime,
      "severeCasesByRequestedTime": output.severeImpact.severeCasesByRequestedTime,
      "casesForICUByRequestedTime": output.severeImpact.casesForVentilatorsByRequestedTime,
      "hospitalBedsByRequestedTime": output.severeImpact.hospitalBedsByRequestedTime,
      "casesForVentilatorsByRequestedTime": output.severeImpact.casesForVentilatorsByRequestedTime,
      "dollarsInFlight": output.severeImpact.dollarsInFlight
    },
    "hospitalBedsByRequestedTime": output.hospitalBedsByRequestedTime
  };
  return obj;
};

const calculateImpact = (req, res) => {
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
      return res.status(400).send({message: 'Bad or incomplete request'});
    }
    if (!req.body) {
      logs.push({ method: req.method, url: req.baseUrl, status: 400 });
      return res.status(400).send({message: 'Bad Request'});
    }
    const output = covid19ImpactEstimator(req.body);
    logs.push({ method: req.method, url: req.baseUrl, status: 200 });
    if (req.params.format === 'xml') {
      const fromJsToXml = js2xmlparser.parse('response', convertToXml(output))
      return res.set('Content-Type', 'text/xml').status(200)
        .send(fromJsToXml);
    }
    return res.status(200).send({ ...output });

  } catch (error) {
    logs.push({ method: req.method, url: req.baseUrl, status: 500 });
    writeToFile(logs);
    return res.status(500).send({error});
  }
};

const getLogs = async (req, res) => {
  logs.push({ method: req.method, url: req.baseUrl, status: 200 });
  const file = await writeToFile(logs);
  return res.set('Content-Type', 'text').status(200).sendFile(path.join(__dirname, `../log/${file}`));
};


module.exports = {
  calculateImpact,
  getLogs
};
