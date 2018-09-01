import { expect } from 'chai'
import faker from 'faker'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

import build from '../support/builders'
import data from '../support/data'

import TeamClient from '../../src/subclients/TeamClient'
import { bearerAuthHeader } from '../../src/support/http'

describe('TeamClient', () => {
  describe('construction', () => {
    it('throws an exception if the API URI is not provided', () => {
      expect(() => {
        new TeamClient({teamId: 1}) // eslint-disable-line no-new
      })
        .to.throw(
        Error, 'Invalid parameter(s): ["apiUrl" is required].')
    })

    it('throws an exception if the API URI is not a string', () => {
      expect(() => {
        new TeamClient({ // eslint-disable-line no-new
          teamId: 1,
          apiUrl: 25
        })
      })
        .to.throw(
        Error, 'Invalid parameter(s): ["apiUrl" must be a string].')
    })

    it('throws an exception if the API URI is not a valid URI', () => {
      expect(() => {
        new TeamClient({ // eslint-disable-line no-new
          teamId: 1,
          apiUrl: 'spinach'
        })
      })
        .to.throw(
        Error, 'Invalid parameter(s): ["apiUrl" must be a valid uri].')
    })

    it('throws an exception if the provided HTTP client is not an object',
      () => {
        expect(
          () => {
            // eslint-disable-next-line no-new
            new TeamClient({
              teamId: 1,
              apiUrl: faker.internet.url(),
              httpClient: 35
            })
          })
          .to.throw(
          Error, 'Invalid parameter(s): ["httpClient" must be a Function].')
      })

    it('throws an exception if the team is not provided', () => {
      expect(() => {
        new TeamClient({ // eslint-disable-line no-new
          apiUrl: faker.internet.url()
        })
      })
        .to.throw(
        Error, 'Invalid parameter(s): ["team" is required].')
    })

    it('throws an exception if the team is not an object', () => {
      expect(() => {
        new TeamClient({ // eslint-disable-line no-new
          apiUrl: faker.internet.url(),
          team: 'wat'
        })
      })
        .to.throw(
        Error, 'Invalid parameter(s): ["team" must be an object].')
    })
  })

  describe('listPipelines', () => {
    it('gets all pipelines for team',
      async () => {
        const bearerToken = data.randomBearerToken()

        const apiUrl = 'https://concourse.example.com'
        const httpClient = axios.create({
          headers: bearerAuthHeader(bearerToken)
        })
        const mock = new MockAdapter(httpClient)

        const teamId = data.randomId()
        const teamName = data.randomTeamName()
        const team = build.client.team(data.randomTeam({
          id: teamId,
          name: teamName
        }))

        const pipelineData = data.randomPipeline({
          teamName
        })

        const pipelineFromApi = build.api.pipeline(pipelineData)
        const pipelinesFromApi = [pipelineFromApi]

        const convertedPipeline = build.client.pipeline(pipelineData)

        const expectedPipelines = [convertedPipeline]

        mock.onGet(
          `${apiUrl}/teams/${teamName}/pipelines`,
          {
            headers: {
              ...bearerAuthHeader(bearerToken)
            }
          })
          .reply(200, pipelinesFromApi)

        const client = new TeamClient({apiUrl, httpClient, team})

        const actualPipelines = await client.listPipelines()

        expect(actualPipelines).to.eql(expectedPipelines)
      })
  })

  describe('getPipeline', () => {
    it('throws an exception if the pipeline name is not provided',
      async () => {
        const bearerToken = data.randomBearerToken()

        const apiUrl = 'https://concourse.example.com'
        const httpClient = axios.create({
          headers: bearerAuthHeader(bearerToken)
        })

        const team = build.client.team(data.randomTeam())

        const client = new TeamClient({apiUrl, httpClient, team})

        try {
          await client.getPipeline()
          expect.fail('Expected exception but none was thrown.')
        } catch (e) {
          expect(e).to.be.an.instanceof(Error)
          expect(e.message)
            .to.eql('Invalid parameter(s): ["pipelineName" is required].')
        }
      })

    it('throws an exception if the pipeline name is not a string',
      async () => {
        const bearerToken = data.randomBearerToken()

        const apiUrl = 'https://concourse.example.com'
        const httpClient = axios.create({
          headers: bearerAuthHeader(bearerToken)
        })

        const team = build.client.team(data.randomTeam())

        const client = new TeamClient({apiUrl, httpClient, team})

        try {
          await client.getPipeline(12345)
          expect.fail('Expected exception but none was thrown.')
        } catch (e) {
          expect(e).to.be.an.instanceof(Error)
          expect(e.message)
            .to.eql('Invalid parameter(s): ["pipelineName" must be a string].')
        }
      })

    it('gets the pipeline with the specified name',
      async () => {
        const bearerToken = data.randomBearerToken()

        const apiUrl = 'https://concourse.example.com'
        const httpClient = axios.create({
          headers: bearerAuthHeader(bearerToken)
        })
        const mock = new MockAdapter(httpClient)

        const teamId = data.randomId()
        const teamName = data.randomTeamName()
        const team = build.client.team(data.randomTeam({
          id: teamId,
          name: teamName
        }))

        const pipelineName = data.randomPipelineName()
        const pipelineData = data.randomPipeline({
          teamName,
          name: pipelineName
        })

        const pipelineFromApi = build.api.pipeline(pipelineData)

        const expectedPipeline = build.client.pipeline(pipelineData)

        mock.onGet(
          `${apiUrl}/teams/${teamName}/pipelines/${pipelineName}`,
          {
            headers: {
              ...bearerAuthHeader(bearerToken)
            }
          })
          .reply(200, pipelineFromApi)

        const client = new TeamClient({apiUrl, httpClient, team})

        const actualPipeline = await client.getPipeline(pipelineName)

        expect(actualPipeline).to.eql(expectedPipeline)
      })
  })

  describe('deletePipeline', () => {
    it('throws an exception if the pipeline name is not provided',
      async () => {
        const bearerToken = data.randomBearerToken()

        const apiUrl = 'https://concourse.example.com'
        const httpClient = axios.create({
          headers: bearerAuthHeader(bearerToken)
        })

        const team = build.client.team(data.randomTeam())

        const client = new TeamClient({apiUrl, httpClient, team})

        try {
          await client.deletePipeline()
          expect.fail('Expected exception but none was thrown.')
        } catch (e) {
          expect(e).to.be.an.instanceof(Error)
          expect(e.message)
            .to.eql('Invalid parameter(s): ["pipelineName" is required].')
        }
      })

    it('throws an exception if the pipeline name is not a string',
      async () => {
        const bearerToken = data.randomBearerToken()

        const apiUrl = 'https://concourse.example.com'
        const httpClient = axios.create({
          headers: bearerAuthHeader(bearerToken)
        })

        const team = build.client.team(data.randomTeam())

        const client = new TeamClient({apiUrl, httpClient, team})

        try {
          await client.deletePipeline(12345)
          expect.fail('Expected exception but none was thrown.')
        } catch (e) {
          expect(e).to.be.an.instanceof(Error)
          expect(e.message)
            .to.eql('Invalid parameter(s): ["pipelineName" must be a string].')
        }
      })

    it('deletes the pipeline with the specified name',
      async () => {
        const bearerToken = data.randomBearerToken()

        const apiUrl = 'https://concourse.example.com'
        const httpClient = axios.create({
          headers: bearerAuthHeader(bearerToken)
        })
        const mock = new MockAdapter(httpClient)

        const teamId = data.randomId()
        const teamName = data.randomTeamName()
        const team = build.client.team(data.randomTeam({
          id: teamId,
          name: teamName
        }))

        const pipelineName = data.randomPipelineName()
        const pipelineData = data.randomPipeline({
          teamName,
          name: pipelineName
        })

        const pipelineFromApi = build.api.pipeline(pipelineData)

        const expectedPipeline = build.client.pipeline(pipelineData)

        mock.onDelete(
          `${apiUrl}/teams/${teamName}/pipelines/${pipelineName}`,
          {
            headers: {
              ...bearerAuthHeader(bearerToken)
            }
          })
          .reply(204, pipelineFromApi)

        const client = new TeamClient({apiUrl, httpClient, team})

        await client.deletePipeline(pipelineName)
        expect(mock.history.delete).to.have.length(1)

        const call = mock.history.delete[0]
        expect(call.url)
          .to.eql(`${apiUrl}/teams/${teamName}/pipelines/${pipelineName}`)
        expect(call.headers)
          .to.include(bearerAuthHeader(bearerToken))
      })

    it('throws the underlying http client exception on failure',
      async () => {
        const bearerToken = data.randomBearerToken()

        const apiUrl = 'https://concourse.example.com'
        const httpClient = axios.create({
          headers: bearerAuthHeader(bearerToken)
        })
        const mock = new MockAdapter(httpClient)

        const teamId = data.randomId()
        const teamName = data.randomTeamName()
        const team = build.client.team(data.randomTeam({
          id: teamId,
          name: teamName
        }))

        const pipelineName = data.randomPipelineName()

        mock.onDelete(
          `${apiUrl}/teams/${teamName}/pipelines/${pipelineName}`,
          {
            headers: {
              ...bearerAuthHeader(bearerToken)
            }
          })
          .networkError()

        const client = new TeamClient({apiUrl, httpClient, team})

        try {
          await client.deletePipeline(pipelineName)
        } catch (e) {
          expect(e).to.be.instanceOf(Error)
          expect(e.message).to.eql('Network Error')
        }
      })
  })
})