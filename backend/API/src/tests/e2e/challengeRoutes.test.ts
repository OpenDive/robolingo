import request from 'supertest';
import app from '../../app';
import { syncDatabase } from '../../config/database';
import User from '../../models/User.model';
import Group from '../../models/Group.model';
import Challenge from '../../models/Challenge.model';
import UserChallenge from '../../models/UserChallenge.model';
import Message from '../../models/Message.model';
import { generateAuthToken, createTestUser } from '../utils';
import { describe, it, beforeAll } from '@jest/globals';
import expect from 'expect';

describe('Challenge Routes', () => {
  let testUser: User;
  let testUserToken: string;
  let testParticipant: User;
  let testGroupId: string;
  let testChallengeId: string;
  let anotherUser: User;
  let anotherUserToken: string;
  let testChallenge: Challenge;
  let testGroup: Group;

  beforeAll(async () => {
    // Sync database before tests
    await syncDatabase(true);

    // Create test users with required fields
    testUser = await createTestUser();
    anotherUser = await createTestUser();
    testParticipant = await createTestUser();

    // Create a test group
    testGroup = await Group.create({
      name: 'Test Challenge Group',
      language: 'Spanish',
      creatorId: testUser.id,
      avatar: 'T' 
    });

    // Create a test challenge
    testChallenge = await Challenge.create({
      title: 'Test Challenge',
      language: 'Spanish',
      type: 'daily',
      stake: 10,
      duration: 30,
      minDailyTime: 15,
      creatorId: testUser.id,
      groupId: testGroup.id,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });

    // Generate auth tokens
    testUserToken = generateAuthToken(testUser);
    anotherUserToken = generateAuthToken(anotherUser);

    // Save IDs for later tests
    testChallengeId = testChallenge.id;
    testGroupId = testGroup.id;
  });

  describe('POST /api/challenges', () => {
    // it('should create a new challenge with group', async () => {
    //   const challengeData = {
    //     title: 'Spanish Challenge',
    //     language: 'Spanish',
    //     type: 'daily',
    //     stake: 100,
    //     duration: 30,
    //     minDailyTime: 15,
    //     participants: [testParticipant.id]
    //   };

    //   const response = await request(app)
    //     .post('/api/challenges')
    //     .set('Authorization', `Bearer ${testUserToken}`)
    //     .send(challengeData)
    //     .expect(201);

    //   expect(response.body.challenge).toBeDefined();
    //   expect(response.body.group).toBeDefined();
    //   expect(response.body.challenge.title).toBe('Spanish Challenge');
    //   expect(response.body.challenge.language).toBe('Spanish');
    //   expect(response.body.challenge.creatorId).toBe(testUser.id);

    //   // Save IDs for later tests
    //   testChallengeId = response.body.challenge.id;
    //   testGroupId = response.body.group.id;
    // });

    it('should not create a challenge without authentication', async () => {
      const challengeData = {
        title: 'French Challenge',
        language: 'French',
        type: 'daily',
        stake: 100,
        duration: 30,
        minDailyTime: 15,
        participants: []
      };

      await request(app)
        .post('/api/challenges')
        .send(challengeData)
        .expect(401);
    });

    // it('should validate challenge input data', async () => {
    //   const invalidData = {
    //     // Missing required fields
    //     title: 'Invalid Challenge'
    //   };

    //   await request(app)
    //     .post('/api/challenges')
    //     .set('Authorization', `Bearer ${testUserToken}`)
    //     .send(invalidData)
    //     .expect(400);
    // });
  });

  describe('GET /api/groups/:groupId/chat', () => {
    it('should get group chat messages', async () => {
      // First add a test message
      await Message.create({
        groupId: testGroupId,
        userId: testUser.id,
        content: 'Hello challenge participants!',
        timestamp: new Date()
      });

      const response = await request(app)
        .get(`/api/groups/${testGroupId}/chat`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].content).toBe('Hello challenge participants!');
      expect(response.body[0].userId).toBe(testUser.id);
    });

    it('should not get chat without authentication', async () => {
      await request(app)
        .get(`/api/groups/${testGroupId}/chat`)
        .expect(401);
    });
  });

  // describe('POST /api/challenges/progress', () => {
  //   it('should update user progress for a challenge', async () => {
  //     // Assign test user to the current challenge
  //     await UserChallenge.create({
  //       userId: testUser.id,
  //       challengeId: testChallengeId,
  //       status: 'active',
  //       joinedAt: new Date()
  //     });

  //     // Update user's current challenge
  //     const challenge = await Challenge.findByPk(testChallengeId);
  //     if (challenge) {
  //       testUser.currentChallenge = challenge;
  //     }
  //     await testUser.save();

  //     const progressData = {
  //       minutes: 20
  //     };

  //     const response = await request(app)
  //       .post('/api/challenges/progress')
  //       .set('Authorization', `Bearer ${testUserToken}`)
  //       .send(progressData)
  //       .expect(200);

  //     expect(response.body.progress).toBeDefined();
  //     expect(response.body.progress).toBeGreaterThanOrEqual(20);
  //     expect(response.body.streak).toBeDefined();
  //     expect(response.body.streak).toBeGreaterThanOrEqual(1);

  //     // Verify user in database
  //     const updatedUser = await User.findByPk(testUser.id);
  //     const today = new Date().toISOString().split('T')[0];
  //     expect(updatedUser?.dailyProgress[today]).toBeGreaterThanOrEqual(20);
  //   });

  //   it('should not update progress without authentication', async () => {
  //     await request(app)
  //       .post('/api/challenges/progress')
  //       .send({ minutes: 15 })
  //       .expect(401);
  //   });
  // });

  describe('GET /api/challenges/user/:userId', () => {
    // it('should get challenges for a specific user', async () => {
    //   const response = await request(app)
    //     .get(`/api/challenges/user/${testUser.id}`)
    //     .set('Authorization', `Bearer ${testUserToken}`)
    //     .expect(200);

    //   expect(Array.isArray(response.body)).toBe(true);
    //   expect(response.body.length).toBeGreaterThan(0);
      
    //   // Verify challenge data
    //   const challenge = response.body.find((c: any) => c.id === testChallengeId);
    //   expect(challenge).toBeDefined();
    //   expect(challenge.title).toBe('Test Challenge');
    // });
  });

  describe('POST /api/challenges/:challengeId/join', () => {
    it('should allow a user to join a challenge', async () => {
      const response = await request(app)
        .post(`/api/challenges/${testChallengeId}/join`)
        .set('Authorization', `Bearer ${anotherUserToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('joined');

      // Verify user was added to challenge
      const userChallenge = await UserChallenge.findOne({
        where: {
          userId: anotherUser.id,
          challengeId: testChallengeId
        }
      });
      
      expect(userChallenge).toBeDefined();
      expect(userChallenge?.status).toBe('active');
    });

    it('should not allow joining without authentication', async () => {
      await request(app)
        .post(`/api/challenges/${testChallengeId}/join`)
        .expect(401);
    });
  });

  describe('GET /api/challenges/:challengeId/leaderboard', () => {
    it('should get challenge leaderboard', async () => {
      // Add some progress for both users
      const today = new Date().toISOString().split('T')[0];
      
      // Update first user's progress
      testUser.dailyProgress[today] = 25;
      await testUser.save();
      
      // Get leaderboard
      const response = await request(app)
        .get(`/api/challenges/${testChallengeId}/leaderboard`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      
      // Verify leaderboard structure
      const entry = response.body[0];
      expect(entry.userId).toBeDefined();
      expect(entry.totalMinutes).toBeDefined();
      expect(entry.streak).toBeDefined();
    });
  });
}); 