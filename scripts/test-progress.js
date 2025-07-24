const { calculateProjectProgress } = require('../features/progress/lib/calculate-progress');

// Test with a sample project ID
async function testProgress() {
  try {
    // This would normally use a real project ID from your database
    const testProjectId = '467b7465-9077-4125-ad4b-ea3402cc9407';
    
    console.log('Testing progress calculation for project:', testProjectId);
    
    const progress = await calculateProjectProgress(testProjectId);
    
    console.log('Progress calculation result:');
    console.log(JSON.stringify(progress, null, 2));
    
    console.log('\nProgress percentage:', progress.progressPercentage + '%');
    console.log('Is complete:', progress.isComplete);
    
  } catch (error) {
    console.error('Error testing progress:', error);
  }
  
  process.exit(0);
}

testProgress();