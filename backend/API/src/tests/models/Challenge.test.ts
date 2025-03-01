import { syncDatabase } from '../../config/database';
import Challenge from '../../models/Challenge.model';
import User from '../../models/User.model';
import Group from '../../models/Group.model';
import { describe, it, beforeAll, afterAll } from '@jest/globals';
import expect from 'expect';
import { createTestUser } from '../utils';

describe('Challenge Model', () => {
  beforeAll(async () => {
    // Sync database before running tests
    await syncDatabase(true);
  });

  it('should create a valid challenge', async () => {
    // Create a test user first
    const user = await createTestUser();
    
    // Create a test group
    const group = await Group.create({
      name: 'Test Group',
      language: 'Spanish',
      creatorId: user.id,
      avatar: 'T'
    });
    
    const challenge = await Challenge.create({
      title: 'Spanish Challenge',
      language: 'Spanish',
      type: 'daily',
      stake: 100,
      duration: 30,
      minDailyTime: 15,
      creatorId: user.id,
      groupId: group.id,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
    
    expect(challenge).toBeDefined();
    expect(challenge.id).toBeDefined();
    expect(challenge.title).toBe('Spanish Challenge');
    expect(challenge.language).toBe('Spanish');
    expect(challenge.stake).toBe(100);
  });

  it('should not create a challenge without required fields', async () => {
    // Attempt to create a challenge without required fields
    let error;
    try {
      await Challenge.create({
        title: 'Incomplete Challenge'
        // Missing required fields
      });
    } catch (e) {
      error = e;
    }

    // Verify the validation error
    expect(error).toBeDefined();
  });

  it('should associate challenge with creator and group', async () => {
    // Create a test user
    const user = await createTestUser();
    
    // Create a test group
    const group = await Group.create({
      name: 'Association Test Group',
      language: 'French',
      creatorId: user.id,
      avatar: 'A'
    });
    
    const challenge = await Challenge.create({
      title: 'French Challenge',
      language: 'French',
      type: 'weekly',
      stake: 50,
      duration: 14,
      minDailyTime: 20,
      creatorId: user.id,
      groupId: group.id,
      startDate: new Date(),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    });
    
    // Retrieve challenge with associations
    const foundChallenge = await Challenge.findByPk(challenge.id, {
      include: [
        { model: User, as: 'creator' },
        { model: Group }
      ]
    });
    
    expect(foundChallenge).toBeDefined();
    expect(foundChallenge?.creator).toBeDefined();
    expect(foundChallenge?.creator.id).toBe(user.id);
    expect(foundChallenge?.group).toBeDefined();
    expect(foundChallenge?.group.id).toBe(group.id);
  });
}); 