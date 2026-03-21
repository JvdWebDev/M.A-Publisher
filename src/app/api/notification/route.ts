import { NextResponse } from 'next/server';

const ONESIGNAL_APP_ID = "8524acbb-4f3e-4e81-acd6-ecf19b99fd16";
const ONESIGNAL_REST_KEY = "os_v2_app_quskzo2phzhidlgw5tyzxgp5cymfotxxysdeo3m4cbfaa3malwe6w7w3wnt6jywmsprcdkcpwdfhnmxqnw56lhprlurwpzoc3ybllsy";

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
export async function PUT(request: Request) {
  try {
    const { id, title, message, url, schedule_time } = await request.json();

    // OneSignal payload - Title ane Message ne 'en' key ma rakhva jaruri che
    const payload: any = {
      app_id: process.env.ONESIGNAL_APP_ID,
      headings: { "en": title },
      contents: { "en": message },
      url: url || "",
    };

    if (schedule_time) {
      const dateObj = new Date(schedule_time);
      // OneSignal standard ISO format swikarche
      payload.send_after = dateObj.toISOString();
    }

    const apiUrl = `https://onesignal.com/api/v1/notifications/${id}?app_id=${process.env.ONESIGNAL_APP_ID}`;

    const response = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Authorization": `Basic ${process.env.ONESIGNAL_REST_KEY}`
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