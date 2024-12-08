const { test, expect, request } = require('@playwright/test');

const apiUrl = 'https://api.restful-api.dev/';
let objectId; 

test.describe('API Tests', () => {
  let apiContext;

  // Setup API context
  test.beforeAll(async () => {
    apiContext = await request.newContext();
  });

  // Cleanup API context
  test.afterAll(async () => {
    await apiContext.dispose();
  });

  test('Complete API Workflow for restful-api.dev', async () => {
    await test.step('1) Get list of all objects (GET)', async () => {
      const response = await apiContext.get(`${apiUrl}objects`);
      expect(response.status()).toBe(200);

      const objects = await response.json();
      console.log('All objects:', objects);
      expect(Array.isArray(objects)).toBe(true);
    });

    await test.step('2) Add an object (POST)', async () => {
      const newObject = {
        name: 'Apple MacBook Pro 17',
        data: {
          year: 2019,
          price: 1849.99,
          'CPU model': 'Intel Core i9',
          'Hard disk size': '1 TB',
        },
      };

      const response = await apiContext.post(`${apiUrl}objects`, {
        data: newObject,
      });

      const addedObject = await response.json();

      expect(response.status()).toBe(200); // Check status
      expect(addedObject).toHaveProperty('id'); // Ensure ID exists

      objectId = addedObject.id; // Save the objectId for other tests
      console.log('Saved Object ID:', objectId);
    });

    await test.step('3) Get a single object using the added ID (GET)', async () => {
      if (!objectId) {
        throw new Error('objectId is undefined. Cannot proceed with GET request.');
      }

      const response = await apiContext.get(`${apiUrl}objects/${objectId}`);
      expect(response.status()).toBe(200);

      const object = await response.json();
      console.log('Fetched Object:', object);

      expect(object.id).toBe(objectId);
      expect(object.name).toBe('Apple MacBook Pro 17');
      expect(object.data.year).toBe(2019);
      expect(object.data.price).toBe(1849.99);
      expect(object.data['CPU model']).toBe('Intel Core i9');
      expect(object.data['Hard disk size']).toBe('1 TB');
    });

    await test.step('4) Update the object using PUT', async () => {
      const updatedObject = {
        name: 'Apple MacBook Pro 17 Updated',
        data: {
          year: 2020,
          price: 1999.99,
          'CPU model': 'Intel Core i9',
          'Hard disk size': '2 TB',
        },
      };

      const response = await apiContext.put(`${apiUrl}objects/${objectId}`, {
        data: updatedObject,
      });

      expect(response.status()).toBe(200);
      const updated = await response.json();
      console.log('Updated Object:', updated);

      expect(updated.id).toBe(objectId);
      expect(updated.name).toBe(updatedObject.name);
      expect(updated.data.year).toBe(updatedObject.data.year);
      expect(updated.data.price).toBe(updatedObject.data.price);
      expect(updated.data['CPU model']).toBe(updatedObject.data['CPU model']);
      expect(updated.data['Hard disk size']).toBe(updatedObject.data['Hard disk size']);
    });

    await test.step('5) PATCH update the object data (PATCH)', async () => {
      const patchedData = {
        data: {
          price: 2099.99, // Change the price field only
        },
      };

      const response = await apiContext.patch(`${apiUrl}objects/${objectId}`, {
        data: patchedData,
      });

      expect(response.status()).toBe(200);
      const patchedObject = await response.json();
      console.log('Patched Object:', patchedObject);

      expect(patchedObject.id).toBe(objectId);
      expect(patchedObject.data.price).toBe(patchedData.data.price);
    });

    await test.step('6) Delete the object using DELETE', async () => {
      const response = await apiContext.delete(`${apiUrl}objects/${objectId}`);
      expect(response.status()).toBe(200);

      const deleted = await response.json();
      console.log('Deleted Response:', deleted);

      // Confirm the object no longer exists
      const verifyResponse = await apiContext.get(`${apiUrl}objects/${objectId}`);
      expect(verifyResponse.status()).toBe(404); // Object should no longer exist and be successfully deleted
    });
  });
});
