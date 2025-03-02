import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { QuizSubmissionData } from '@/services/quizService'

// File paths
const QUIZ_RESULTS_FILE = path.resolve(process.cwd(), 'data/quiz_results.json')
const WALRUS_TRANSACTIONS_FILE = path.resolve(process.cwd(), 'data/walrus_transactions.json')

// Initialize files if they don't exist
async function initializeFiles() {
  const dataDir = path.resolve(process.cwd(), 'data')
  
  try {
    // Check if data directory exists, create if not
    try {
      await fs.access(dataDir)
    } catch (error) {
      await fs.mkdir(dataDir, { recursive: true })
    }
    
    // Initialize quiz results file if it doesn't exist
    try {
      await fs.access(QUIZ_RESULTS_FILE)
    } catch (error) {
      await fs.writeFile(QUIZ_RESULTS_FILE, JSON.stringify([]))
    }
    
    // Initialize Walrus transactions file if it doesn't exist
    try {
      await fs.access(WALRUS_TRANSACTIONS_FILE)
    } catch (error) {
      await fs.writeFile(WALRUS_TRANSACTIONS_FILE, JSON.stringify([]))
    }
  } catch (error) {
    console.error('Error initializing files:', error)
    throw error
  }
}

// Save quiz results to JSON file
async function saveQuizResults(walletId: string, quizData: QuizSubmissionData) {
  await initializeFiles()
  
  try {
    // Read existing quiz results
    const fileContent = await fs.readFile(QUIZ_RESULTS_FILE, 'utf-8')
    const quizResults = JSON.parse(fileContent)
    
    // Add new quiz result with wallet ID
    const newQuizResult = {
      id: uuidv4(),
      walletId,
      ...quizData,
      timestamp: new Date().toISOString()
    }
    
    quizResults.push(newQuizResult)
    
    // Save updated quiz results back to file
    await fs.writeFile(QUIZ_RESULTS_FILE, JSON.stringify(quizResults, null, 2))
    
    return newQuizResult
  } catch (error) {
    console.error('Error saving quiz results:', error)
    throw error
  }
}

// Function to create a blob in Walrus and return the transaction hash
async function createWalrusBlob(data: any) {
  // Use a more direct approach for environment variables in API routes
  // Check .env.local file and fall back to hardcoded values for testing
  const walrusPublisher = process.env.WALRUS_PUBLISHER || "https://publisher.walrus-testnet.walrus.space";
  const walrusWalletAddress = process.env.WALRUS_WALLET_ADDRESS || "0xdb5b3b7499e4bedab66447a08145fa499134f02a09c133279a8496ca2907ea6a";
  const privateKey = process.env.WALRUS_PRIVATE_KEY || "suiprivkey1qp8a7da9wq7dke3qklkcncq33d67qdlnuuyxqr407q58glwkvu8qu8cj8n6";
  
  // Add debug logging to see what's happening
  console.log('Debug - Environment variables:');
  console.log('WALRUS_PUBLISHER:', walrusPublisher ? 'found' : 'missing');
  console.log('WALRUS_WALLET_ADDRESS:', walrusWalletAddress ? 'found' : 'missing');
  console.log('WALRUS_PRIVATE_KEY:', privateKey ? 'found (value hidden)' : 'missing');
  
  // We'll always have a value now due to fallbacks
  console.log(`Creating blob in Walrus at: ${walrusPublisher}`);
  
  // Prepare the data as a JSON string
  const blobContent = JSON.stringify(data);
  
  try {
    // Create blob endpoint with parameters
    const params = new URLSearchParams({
      epochs: '1',
      deletable: 'false',
      encodingType: 'utf-8'
    });
    
    // Full URL for the request
    const url = `${walrusPublisher}/v1/blobs?${params.toString()}`;
    
    // Prepare headers with different auth options to try
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Content-Length': blobContent.length.toString(),
    };
    
    // Try different authentication methods
    const authOptions = [];
    
    // Option 1: Standard Bearer token authentication
    if (privateKey) {
      authOptions.push({
        ...defaultHeaders,
        'Authorization': `Bearer ${privateKey}`
      });
    }
    
    // Option 2: Custom SUI authentication header
    if (privateKey) {
      authOptions.push({
        ...defaultHeaders,
        'X-Sui-Private-Key': privateKey
      });
    }
    
    // Option 3: No authentication headers
    authOptions.push(defaultHeaders);
    
    let lastError = null;
    
    // Try each authentication method in sequence
    for (let i = 0; i < authOptions.length; i++) {
      try {
        console.log(`Trying auth method ${i + 1}/${authOptions.length}`);
        
        const response = await fetch(url, {
          method: 'PUT',
          headers: authOptions[i],
          body: blobContent,
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log('Successfully created blob in Walrus:', result);
          
          // Extract blob object ID from the response if available
          const blobObjectId = result?.newlyCreated?.blobObject?.id || null;
          
          return {
            transactionHash: result.blobId || result.id || result.hash,
            blobObjectId: blobObjectId,
            walrusResponse: result
          };
        } else {
          // Store the error but continue to the next auth method
          const errorText = await response.text().catch(() => 'No response body');
          lastError = new Error(`Walrus API error with auth method ${i + 1}: ${response.status} ${response.statusText}. Response: ${errorText}`);
          console.warn(lastError.message);
        }
      } catch (error) {
        lastError = error;
        console.warn(`Error with auth method ${i + 1}:`, error);
      }
    }
    
    // If we've tried all options and none worked, throw the last error
    if (lastError) {
      throw lastError;
    } else {
      throw new Error('All authentication methods failed without specific errors');
    }
  } catch (error) {
    console.error('Error creating blob in Walrus:', error);
    throw error;
  }
}

// Send quiz data to Walrus and log transaction
async function sendToWalrus(walletId: string, quizData: QuizSubmissionData) {
  try {
    // Format data for Walrus
    const walrusData = {
      walletId,
      quizId: quizData.quizId,
      language: quizData.language,
      title: quizData.title,
      score: quizData.score,
      totalQuestions: quizData.totalQuestions,
      percentage: quizData.percentage,
      timestamp: quizData.timestamp,
      correctQuestions: quizData.questions
        .filter(q => q.isCorrect)
        .map(q => q.id),
      wrongQuestions: quizData.questions
        .filter(q => !q.isCorrect)
        .map(q => q.id),
      challengeId: quizData.challengeId
    }
    
    try {
      // Create the blob in Walrus
      const result = await createWalrusBlob(walrusData);
      
      // Log Walrus transaction
      await logWalrusTransaction(walletId, result.transactionHash, {
        ...walrusData,
        walrusResponse: result.walrusResponse
      }, result.blobObjectId);
      
      return {
        transactionHash: result.transactionHash,
        blobObjectId: result.blobObjectId,
        success: true,
        walrusResponse: result.walrusResponse
      };
    } catch (walrusError) {
      console.error('Error with Walrus integration, continuing with local storage only:', walrusError);
      
      // Create a mock transaction hash for local storage
      const localTransactionHash = `local-${uuidv4()}`;
      
      // Log the error with the transaction
      await logWalrusTransaction(walletId, localTransactionHash, {
        ...walrusData,
        error: walrusError instanceof Error ? walrusError.message : 'Unknown Walrus error'
      });
      
      // Return a response that indicates local storage only
      return {
        transactionHash: localTransactionHash,
        success: true,
        walrusIntegration: false,
        localOnly: true
      };
    }
  } catch (error) {
    console.error('Error sending data to Walrus:', error)
    throw error
  }
}

// Log Walrus transaction to file
async function logWalrusTransaction(walletId: string, transactionHash: string, data: any, blobObjectId?: string) {
  await initializeFiles()
  
  try {
    // Read existing transactions
    const fileContent = await fs.readFile(WALRUS_TRANSACTIONS_FILE, 'utf-8')
    const transactions = JSON.parse(fileContent)
    
    // Add new transaction
    transactions.push({
      id: uuidv4(),
      walletId,
      transactionHash,
      ...(blobObjectId ? { blobObjectId } : {}),
      data,
      timestamp: new Date().toISOString()
    })
    
    // Save updated transactions back to file
    await fs.writeFile(WALRUS_TRANSACTIONS_FILE, JSON.stringify(transactions, null, 2))
  } catch (error) {
    console.error('Error logging Walrus transaction:', error)
    throw error
  }
}

// API route handler for POST method
export async function POST(request: NextRequest) {
  try {
    const { walletId, quizData } = await request.json()
    
    if (!walletId || !quizData) {
      return NextResponse.json(
        { error: 'walletId and quizData are required' },
        { status: 400 }
      )
    }
    
    // Save quiz results to JSON file
    const savedQuizResult = await saveQuizResults(walletId, quizData)
    console.log('Quiz results saved successfully to local file')
    
    // Try to send to Walrus, but don't fail if it doesn't work
    let walrusResponse
    let walrusError = null
    let blobObjectId = null
    try {
      walrusResponse = await sendToWalrus(walletId, quizData)
      // Extract blob object ID if available
      if (walrusResponse.blobObjectId) {
        blobObjectId = walrusResponse.blobObjectId
        console.log('Blob Object ID:', blobObjectId)
      }
    } catch (error) {
      console.error('Failed to send to Walrus, but quiz data was saved locally:', error)
      walrusError = error instanceof Error ? error.message : 'Unknown Walrus error'
      
      // Create a mock response for the client
      walrusResponse = { 
        transactionHash: `local-${uuidv4()}`,
        success: false,
        error: walrusError
      }
      
      // Still log the attempt
      await logWalrusTransaction(walletId, walrusResponse.transactionHash, {
        ...quizData,
        error: walrusError
      })
    }
    
    return NextResponse.json({
      success: true,
      transactionHash: walrusResponse.transactionHash,
      id: savedQuizResult.id,
      walrusSuccess: !walrusError,
      ...(blobObjectId ? { blobObjectId } : {}),
      ...(walrusError ? { walrusError } : {})
    })
  } catch (error) {
    console.error('Error in quiz POST endpoint:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    )
  }
}

// API route handler for GET method
export async function GET(request: NextRequest) {
  try {
    await initializeFiles()
    
    const { searchParams } = new URL(request.url)
    const walletId = searchParams.get('walletId')
    
    if (!walletId) {
      return NextResponse.json(
        { error: 'walletId is required' },
        { status: 400 }
      )
    }
    
    // Read quiz results file
    const fileContent = await fs.readFile(QUIZ_RESULTS_FILE, 'utf-8')
    const quizResults = JSON.parse(fileContent)
    
    // Filter results by wallet ID
    const walletResults = quizResults.filter(
      (result: any) => result.walletId === walletId
    )
    
    return NextResponse.json({
      success: true,
      results: walletResults
    })
  } catch (error) {
    console.error('Error in quiz GET endpoint:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    )
  }
}
