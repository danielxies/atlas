// app/api/generate-email/route.ts
import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/*
Expected JSON payload structure:
{
  "professor": {
    "lastName": "Doe",
    "researchArea": "Machine Learning"
  },
  "user": {
    "name": "Alice Johnson",
    "year": "Junior",
    "major": "Computer Science",
    "university": "State University",
    "researchInterests": ["Deep Learning", "Computer Vision"],
    "experience": "Completed multiple research projects on neural networks",
    "skills": ["Python", "TensorFlow", "Keras"],
    "resumeUrl": "https://...", 
    "linkedin": "https://linkedin.com/in/alicejohnson",
    "github": "https://github.com/alicejohnson",
    "otherLinks": ["https://portfolio.example.com"]
  }
}
*/
export async function POST(request: Request) {
  try {
    const { professor, user } = await request.json();

    if (!professor || !user) {
      return NextResponse.json({ error: 'Missing professor or user information' }, { status: 400 });
    }

    const prompt = `Generate a professional email for a student inquiring about research opportunities.
Given the following information about the student:
Professor Last Name: ${professor.lastName}
Professor Research Area: ${professor.researchArea}
Professor Research Description: ${professor.researchDescription}
Student Name: ${user.name}
Student Year: ${user.year}
Student Major: ${user.major}
Student University: ${user.university}
Student Research Interests: ${user.researchInterests.join(', ')}
Student Experience Summary: ${user.experience}
Student Skills: ${user.skills.join(', ')}
Resume URL: ${user.resumeUrl}
LinkedIn: ${user.linkedin}
GitHub: ${user.github}
Additional Links: ${user.otherLinks.join(', ')}

Please generate an email using the information above. You should fill in information when empty inferred from the above information and edit the email so it sounds professional and tailored to the specific professor using the information above. Use the following structure for the email:

Subject: Inquiry Regarding Research Opportunities in ${professor.researchArea}

Dear Professor ${professor.lastName},

I hope this email finds you well. My name is ${user.name}, and I am currently a ${user.year} student pursuing a degree in ${user.major} at ${user.university}. I am very interested in your research on ${professor.researchArea} and *elaborate using the professor's research description above*. Given my background and passion for ${user.researchInterests.join(', ')}, I believe my previous experience aligns closely with your ongoing projects. Specifically, I have ${user.experience} and possess skills in ${user.skills.join(', ')}.

For your convenience, I have included my resume and profile links below:

Resume: *Add Resume Link*
LinkedIn: *Add Linkedin*
GitHub: *Add Github*
Additional Links: ${user.otherLinks.join(', ')}

I would greatly appreciate the opportunity to discuss potential involvement in your research group further. Thank you very much for your time and consideration.

Warm regards,  
${user.name}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that composes professional inquiry emails.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 600,
      temperature: 0.2,
      top_p: 0.9,
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
    });

    const emailContent = response.choices[0].message.content;
    // We expect the response to include a subject line starting with "Subject:" followed by the body.
    return NextResponse.json({ email: emailContent });
  } catch (err: any) {
    console.error('Error generating email:', err.message || err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
