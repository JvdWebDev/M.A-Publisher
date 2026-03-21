import { NextResponse } from 'next/server';

const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;
const ONESIGNAL_REST_KEY = process.env.ONESIGNAL_REST_KEY;


// 1. POST: Notification mokalva/schedule karva mate
export async function POST(request: Request) {
  try {
    const { title, message, url, schedule_time } = await request.json();

    const payload: any = {
      app_id: ONESIGNAL_APP_ID,
      included_segments: ["All"],
      headings: { "en": title },
      contents: { "en": message },
      url: url,
    };

    if (schedule_time) {
      payload.send_after = schedule_time;
    }

    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Authorization": `Basic ${ONESIGNAL_REST_KEY}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 2. GET: Notification history ane scheduled list melavva mate
export async function GET() {
  try {
    const response = await fetch(
      `https://onesignal.com/api/v1/notifications?app_id=${ONESIGNAL_APP_ID}&limit=10`,
      {
        method: "GET",
        headers: {
          "Authorization": `Basic ${ONESIGNAL_REST_KEY}`
        }
      }
    );

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 3. DELETE: Scheduled notification ne cancel karva mate
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get('id');

    if (!notificationId) {
      return NextResponse.json({ error: "Notification ID is required" }, { status: 400 });
    }

    const response = await fetch(
      `https://onesignal.com/api/v1/notifications/${notificationId}?app_id=${ONESIGNAL_APP_ID}`,
      {
        method: "DELETE",
        headers: {
          "Authorization": `Basic ${ONESIGNAL_REST_KEY}`
        }
      }
    );

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 4. PUT: Scheduled notification ne EDIT/UPDATE karva mate
// 4. PUT: Scheduled notification ne EDIT/UPDATE karva mate
export async function PUT(request: Request) {
  try {
    const { id, title, message, url, schedule_time } = await request.json();

    const payload: any = {
      app_id: ONESIGNAL_APP_ID, // process.env kadhi nakho, upar no variable vapro
      headings: { "en": title },
      contents: { "en": message },
      url: url || "",
    };

    if (schedule_time) {
      const dateObj = new Date(schedule_time);
      payload.send_after = dateObj.toISOString();
    }

    // Ahiya pan ONESIGNAL_APP_ID variable vapro
    const apiUrl = `https://onesignal.com/api/v1/notifications/${id}?app_id=${ONESIGNAL_APP_ID}`;

    const response = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Authorization": `Basic ${ONESIGNAL_REST_KEY}` // process.env kadhi nakho
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (data.errors) {
      return NextResponse.json({ error: data.errors[0], success: false }, { status: 400 });
    }

    return NextResponse.json({ success: true, id: id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}