import { useState } from "react";
import DriverTable from "../components/DriverTable/DriverTable";
import Filter from "../components/Filter/Filter";
import AppliedFilters from "../components/AppliedFilters/AppliedFilters";
import { isSameDay } from "date-fns";
import { Typography, Space, Button } from "antd";

const { Title, Text } = Typography;
export type DriverStatus =
  | "active"
  | "inactive"
  | "suspended"
  | "pending"
  | "blocked";

export interface Driver {
  driverId: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  profilePicUrl: string;
  dob: string;
  gender: "male" | "female" | "other";
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
  };
  role: "premium" | "elite" | "normal";
  status: DriverStatus;
  rating: number;
  totalTrips: number;
  availability: {
    online: boolean;
    lastActive: string | null;
  };
  kyc: {
    overallStatus: "verified" | "pending" | "rejected" | string;
    verifiedAt: string | null;
  };
  credit: {
    limit: number;
    balance: number;
    totalRecharged: number;
    totalUsed: number;
    lastRechargeAt: string | null;
  };
  recharges: {
    transactionId: string;
    amount: number;
    paymentMethod: string;
    reference: string;
    status: string;
    createdAt: string;
  }[];
  creditUsage: {
    usageId: string;
    tripId: string;
    amount: number;
    type: string;
    description: string;
    createdAt: string;
  }[];
  createdAt: string;
  updatedAt: string;
  vehicle: {
    vehicleId: string;
    vehicleNumber: string;
    vehicleModel: string;
    vehicleType: string;
    fuelType: string;
    registrationDate: string;
    insuranceExpiry: string;
    rcDocumentUrl: string;
    status: boolean;
  } | null;
  documents: {
    documentId: string;
    documentType: string;
    documentNumber: string;
    documentUrl: string;
    licenseStatus: string;
    expiryDate: string;
  }[];
  performance: {
    averageRating: number;
    totalTrips: number;
    cancellations: number;
    lastActive: string | null;
  };
  payments: {
    totalEarnings: number;
    pendingPayout: number;
    commissionPaid: number;
  };
  activityLogs: {
    logId: string;
    action: string;
    details: string;
    createdAt: string;
  }[];
}


export interface Filters {
  status: DriverStatus[];
  joined_at: Date | null;
  license_expiry_date: Date | null;
}

const Drivers = () => {
  const [filters, setFilters] = useState<Filters>({
    status: [],
    joined_at: null,
    license_expiry_date: null,
  });

  const STATUSES: DriverStatus[] = [
    "active",
    "inactive",
    "suspended",
    "pending",
    "blocked",
  ];
  const DATA: Driver[] = [
    {
      driverId: "drv-001",
      fullName: "Ramesh Kumar",
      phoneNumber: "+91-9876543210",
      email: "ramesh.kumar@example.com",
      profilePicUrl:
        "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxAQEBARERAVEhEVEBAVEBASEA8SFxUVFREXFhYVFRcYHSggGBolGxUVITEiJSkrLi4uFx8/ODMsNygtLisBCgoKDg0OGhAQGy0mICUtLS0tLS4tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIAOEA4QMBEQACEQEDEQH/xAAcAAEAAgMBAQEAAAAAAAAAAAAABQYDBAcBAgj/xAA8EAACAQMABwQJAQYHAQAAAAAAAQIDBBEFBhIhMUFRE2FxgQciMkJSkaGxwdEjYnKisvAUFTNDU4Lhkv/EABsBAQACAwEBAAAAAAAAAAAAAAAEBQIDBgEH/8QANBEBAAIBAwMCAwcDAwUAAAAAAAECAwQRIQUSMUFREzJhBhQicYGhscHR8CMzkSRCcuHx/9oADAMBAAIRAxEAPwDuIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADxs8m0R5GKd3TjxnH5ojX12np814ZxjtPoxPSVFe/9JP8ABFt1nR183/af7M/u+T2eLSdH4/5ZfoK9Z0dvF/2n+x93yezLC8pvhNfPBIpr9Nf5bwxnFePMMyafAlVvW3MS17PTIAAAAAAAAAAAAAAAAAAAAAAAGrc30KfF5fwreyv1fU9Ppvnnn2htx4bX8Iyvpeb9lKK+bOa1P2hzX4xRtH7plNJWPmaNStKXtSb8WU2XV5ss73tMpFcda+IfBHlmAAAH1TqSj7La8G0bsepy453raYYzSs+YbtDStSPHEl37n8y303X9Rj4v+KP3R76Wk+OEnbaRpz3Z2X0f4Z0mk6vp9RxvtPtKHkwXo3C0aQ9AAAAAAAAAAAAAAAAAA+KtWMU3J4RqzZqYaza87Q9rWbTtCEvdKSllQ9WPXm/0OP6h12+XemHiPf1WGLSxXmyPOfmZmd5S9g8EDpzXCxs9qNWunUXGjT/aT8Gl7Pm0WWm6TqdRtNa7R7y1XzUq53pj0r3M5tWtKFKmnudSPaTfjv2Y+Cz4nRaf7PYKx/qzMz/wi21Np8MWjvStewku2p0qsM70ounLHc02voZ5vs9prR+DeJ/5eV1N48prSPpcpKMf8PazlJpbXbSjBRfRbGXL6ELF9mp3/wBS/H0/yGy2r9obmqnpMp3NWNG5pKhObxTqRk3ByfCMs74tvg968DTrugTipN8M77eYe49TvO1odBObSwABu2ekp09z9aPR8V4MutB1rLp/w3/FX94RsumrbmOJTlvXjUWYvP48Ts9Nqseop3Y5V16TSdpZSSxAAAAAAAAAAAAAAAMNzcRpx2peS5t9ERdXq8emxze8/wDtnSk3naFeu7qVR5fDkuhwWu6hk1d97ePSFpixVxxwwEBtAKJ6Uda3aUlb0Z4uKq9aUXvp0uDfdKXBeb5I6HofTvjX+Nkj8MePrKLqMu0dsOKtnaILwAAA9At916R9IzpUqcKipbEIxlUjGMp1Gljak5J48vmVVOjaWLzea77z+kNs577bbsejPSJpKjJOVft486dWMGn/ANklJfPyPc/R9Jljbt2n3jcrmvX1dg1V1jo6QoKrT9WSeKtJvLhLHDvT5Pmcb1DQX0eTtt4nxKdiyReE0QG1kt68qctqLx+e5krS6zJpr99Ja8mOLxtKw2V3Gqsrc1xj0O80HUMerx91fPrCry4pxztLZLBrAAAAAAAAAAAAA+KtRRTk3hI1Zs1cNJvbxD2tZtO0K3eXLqSy+HJdEfPeoa6+ryd0+PSFtixRjrswEBtAKlr/AK3/AOXU4xppSuKmezUuEIrjOS579yXPyLnpHTPvdptf5Y/eUfPl7OI8uG3t3UrVJ1as3OpN5nOTy2/75Hc46VpWK1jaIQJmZ5lgM3gAAAAAAC2+jjWWnYXM3W2uyqwUJyjvUWpZjJrml6y3fEVXV9DbV4dqeY5bcOTstvLu8JqSUotNNJpp5TT3po4C1ZrM1nzCyid+X0ePWS3rOElKPH7royTpNVfTZIvT/wCsMlIvG0rJa3CqRUl5ro+h9D0eqpqcUZKqm9JpO0sxKYAAAAAAAAAAAAgdMXe1LYXsx497OK671D4uT4NJ4jz9ZWOlxdsd0o855LAAHDvS7VctJyT4RoUYr+aX3mzvehViujr9Zmf8/wCFbqOckqUXDSAAAG3U0ZcRW1K3rRjjO1KjViseLQ3gagAAAA776Mbp1NF2zfudpTWekKjjH6YXkcD1zHFNZbb12lY6ad6LSVDeAbejbrs57/Ze6X6lv0fXzps21vlnyj6jF3148rEmd9E78qt6egAAAAAAAAA1dIXHZwb5vdHxZX9T1f3bTzf18Q24ad9tlbPnMzvO8reAABgvZ1I05OlTVSa9mEp9mnv+LDwbcFKXvFbztHv5Y2mYjeH5y1i0rUu7mtXqpRnKXsRbaiopRUU+eElvPpGlwUwYa0p4iFXa02mZlGkhil9WdXLjSFbsqEVuWalSTxCEc4zJ9/JLe/njG1or5exWZ8OhWvodjj9retvn2dFL5bUn9jV8b2ht+DPuseg/Rto+1kpuM6808xddxlFPliEUovrvTMLZZlnGKIXLLNbYitKau2d1/r21Oo/icEpLwmvWXzMovMMZpEuFa/6Gt7K9lQt5TcFCEpKbUtmUsvZTW9rGHv37+ZJx2m0byjXr2ztCtmbEA6zqvrrYWGjaFNzdSsoycqNOE87c5OWy5NKK48c/M5XXdJ1Gq1c38V9/ol481aU29V91fuqla1oVqq2Z1KanKK4R2/WUfJNLyOe1uKmLPbHTxE7JWOZmsTKQIrMAn9D3G3DD4x3eXI7zoms+Pg7Z814Vepx9tt49W+XSOAAAAAAAAAILTdbM1HlFfV/+YOK+0Op780Yo8R/Kx0lNq9yOOeSwD5qSwm8N4WcLi+5d5lSvdaIeTO0KnrfrlbULSs6NxTncOLhSpxnGUlJvZcpR4x2d7381guendKzX1FfiVmKxzv8Awj5c1e3ieXB0jukAA6z6DLqGzeUcYqbVKpnrHDjjyf8AUaM0eJbsUuqGhvAAAD85+kHP+Z3mePaQ+XYwx9MEvF8sIuT5pV4zYPQOg6h+j1XUP8Rd7cKe3+zpY2XViksybe9Qb3buOGUHVOsxp5+Hi2mff2SMODv5nw7GkksJYS4JcjipmbTvKw22engAbei62xUXR7n58Prgt+i6n4OqiJ8W4lH1NO6n5LGd+qwAAAAAAADxs8tO0biq16m1KUurbPmWryzlz3vPrK5x17axD4I7MAAQWnNUbG8blWoLtP8Alg5U5+bj7XnksdL1XU6eNq249p5ar4aW8w45r/oCho+5jRozqTzSVSXabG7alJRjHCWd0efVHZ9L1l9Vh+JeIjnbhAy0ilu2DV3Um5v7apcW7g3Ct2bpSey5JQjJyjLh7yWHjxJ1rxWeWMVmfC2+jDVPSFrfOtXoulSVGrCTlKm9raccKKi3zinnuMMl6zDPHW0WdaI6QAAAHOtftSP8bPtaUlCulh7WdmpHjHLXstZxnD+hnjy9vEsMmLu5hzDTerF3ZxUq9PEHLZU4yjNZw3y3rcnxRIretvCPalq+UOmZsX6I1H0tK8sLetN5qbLhUfWdNuDl54z5nzvq2njBqrVjxPMfqssFu6kJ0rm4AAEzKlpraLR6PJjeNlqoT2oxl1SZ9O0+T4mKtveFLaNpmGQ3PAAAAAAAGG9ns05v91kXXX7NPe30Z443tCrnzNcgAAAA5x6YtBOpSpXdOm5Sp5hXlHiqW9xk10Um9/La6HUfZzVbTbDM/WEPVU8WhK+hyCWjE+txVb8lFfg6TN8zXi8Lyam0AAAAGG4obS7+T/B5MbvYnZSfSNZOro64WPWhsVOGcbE05fy7R7hna7HNG9Fe1U1Cs61pQr1+0lOpTU2lUcIpS3pLZ38MczZkzTE7Q148MWrEy6PoSxp29GNGlBQpwyoxWXx3ttve223vZxnXI/6ju94TMdYiNob5TtgAAAWHRE80o92V9T6D0XJ36On04VOojbJLdLVpAAAAAAAamlnijPy/qRV9Zt26O8/l/MN2n/3IVw+erYAAAABJPc0mmmmmspp8Uyx6Vm+Fqaz78MMkb1V70fWStqFxar/YvbiCXSMtmdP5wlFndZJ3ndCxxtGy0GttAAAAAAg9KQVSFaOMqcKkcdU4tGETtO7OY3rs19EWnYW9Cj/x0aUPOMEn9ULzEzMlI2rEJqjHCSOH1+f42e1v0b4jaH2Q3oAAATug3+zfdN/ZHb/Z22+mmPr/AEhWav50iX6MAAAAAAA09LLNGf8A1/qRV9ar3aO8fl/MN2n/ANyFdPnq2AAAAAPa2msxMeg8pWyVSdVbnOMVNcm4Z2ZeOHjwUeh3mj1UajDFvVEtXaWwSgAAAAGre1sLZXF8fAxtLKsNKKzuRpyXjHWbW8QzZ6NB5y/kUOv6rW1OzD6+ZZxVsnPMwAAAATmgl+zf8b+yO3+ztdtNP/l/SFbq/n/RJF+igAAAAAAMF9DNOa/df0Ievp36a9fo2Yp2vEqwfNFwHoAAAAD2L3k3p+WceorPpuxtG8Mx3SMAAAACMu368vL7GufLZHh5br1l/fIr+p27dNb6sq+W6cW2h6AAAAAsOh44pR7239Tv+h07dHWfflVamd8kt0t2gAAAAAAB5JZWDG9e6sxJCqVYbMnHo2vkfMdTjnHltSfSV1Sd6xL5NLIAAAAA9idp3GZM77S5oy4q3hFmNpekh4AAAETUllt9WzXLYzWsOfyOd61qomIw1/VsrDZOeZgAAAAHtazadoJnZabanswjHpFL6H03S44x4a09oUt53tMspIYgAAAAAAAEBpmjs1M8pLPnz/Bw/wBoNN8PUd8eLfystJfeu3s0ChSgAAAAAPqEsFn07XW09+30lheu7Innejs4neN0d6egBhup7MX1e5HkvY8tGjT2n3LiVfUNZ92x8eZ8NtY3biRx97Tae6fLa9MQAAAAGzo6jt1Irkt78v8A3BZ9I03x9TWPSOZ/z82jUX7aSsp9DVQAAAAAAAAA09KW+3TeOK3r8oqur6T7xp528xzDdgydl1dPny2AAADQ0zpelaUnUqvdwhFb5Tl8MV/aRL0eiyaq/ZT9Z9mvJkikby5zf69X0pudJwppezScFNP+Nve34YOuxdC0tadt4mZ90G2pvM8JPV70lqtVpUa9u4zqVadOM6Usx2pzUVtRlvSy1wbIeT7OxW0Xx24ifEtlNVvxMOhSew8+4/o/0Ljw2eWRVYv3l80e7vNh1I/EvmhubNC5rbT7lw/Uwmd2cRshtYNYoaPpKrKnKptTUIxi4x9bZlL1m+C9V8EyDq+nzrO2sTts8vl+HG6kVvSFfV5Ps1ChTXKMduTfRynux4RRsw9B0uOPxb2lFtqrz4WXVzXlVJRpXSUJPdGtHKg30kvdffw8Cr6h0KaRN8HMezfi1O/Fl2Oa8JgAAATmhbfZi5vjLh4Hb9A0fwsPxLebfwrdVk7rbR6JIv0UAAAAAAAAADwV7Str2c8r2ZcO580cJ1rQfd8vfX5bfys9Nl767T5hpFKkgGrd6Ro0t06iT+He38lvLDS9L1Wp5x0nb39EPPr8GDi9ufZyXWjSdS5uZzmmlFuNKD92Ce7zfFv9EdvotFGkxRj9fX80Kc8ZvxxPCJJjxvaq2alpKyly7eLl4xTkn80jy0/hllT5odyazxIaa0Li2cd63r7GMwziWuYvQPVV9JVt2lkse7cUnnx2ov6N/I34PmR9R8rn1OCiklwRKQn0HrpepGnk7aMK8tmUJbNOcs+tBJYzLqnlb+iOW6r0TNbJObBXeJ8x9W3F1HDSfh5LbSt0ZJrKeU+DW85e9LUnttG0rOtotG9XpiybFjbOpNLkt8n3Fj0zRTqs0R6RzLTnydlVlisLC4H0OtYrERCp3emQAAAAAAAAAAGK5oKpFxfP6PqRtVpqajHOOzKl5rO8K1cUHCTjLj911R871ekvpss0ut8d4vXeFa0/plxbpUnh+/Ncv3Y9/VnVdA6FXJWNRqI49I/q53q3VZpM4cU/nKss7etYrG0OXmZmd5at/YxqrfukvZl07u9GvLii6VpdVbBbjwrdzbypy2ZLD5dH3pldek1naXR4c1Mtd6yxxk0008NNNNbmmnlNd6aRg3Ouamayq8p7E3i4ppdouG2uHaR/K5PuaNF6bTwlY790LIa21hnbQfLHhuPNnu7FWo0qcZTnLZhFNylKWEkuLYipN9nJNa9Pu8q+qnGhDKow4ceM5L4n9F55lUp2whZL90oQza0ro3RTliVRYjyjzfj0RKw6ffmyq1nUIr+DH5906lgnRG3hRTMzO8tzR2kalB5i8xz60Hwf6PvK3qPSsGtpMXjn0lN0evy6a29Z49l30dXVxGMqe/a3Y5p80z5tn6Znxan7vMc+n93bYNXjzYvi1nha7G1VOOOfvPqzuOn6KukxRSPPqg5ck3tu2Cc1gAAAAAAAAAAAAaukLRVYNcJYexLGcPG7PVEPV6HFqoiMkeGVclqRPa4/pXR9W3qyhWjieW9rlLf7UXzRfYu3siK+Iclnx3peYv5ahsaADFc28akdmSyuXVd6ZhekXjaW7DmvitvWVev9HTpb/ah8SXD+LoV+XDan5Og02tpmjbxLDY3lShUhVpS2ZxeYv7prmnwaNExunRO3MOxas6fp3tLajiNSOFVpZy4vqusXvwyNau0plLxaEvKSSbbSSTbbaSSXFt8kYs3KddtaXdy7Gk2reLznh2sl7z/dXJefTEilNuZRMl+7hWaFCU3sxWX9vHobq1m07QjZc1Mcb2lPWGio08Sl60/ovDr4k7Fp4rzPlRarqFsn4acQkSSrQDLaWs6s406cXOcnuivu+i7zG1orG8s8eO17dtYdT1V0ArOm9p7VWWHNrOF3RX55/JFbm7b379uXSaPTzgptM+U6YpYAAAAAAAAAAAAAABo6W0VRuqexVjle7JbpRfWL5GVLzWd4ac2CmWu1nNdP6r17VuWO0o8qkVwX765ePDwJ2PNWyg1OhyYuY5hBG5CAPGeS9iZjmEXe6HjLfT9V/Dyfh0I2TTRPNVpp+p2r+HJzDQs7i4s60akMwmufGMlzi+Uk+hBvimOJhd4dRS/NJTWsmt9W9hCjTg6cHFdrBPac5c1lL2F058zXTHy3Zc8bc8QjLPQze+o9lfCuPm+ROx6aZ5sptR1OscY+fqmaNGMFiKSXd+epMrWK8QpsmW+Sd7SyGTWASuhNX692/Ujsw51ZJ7K8Pifcvoar5a0SsGkyZp48e7pegtA0bSOKazN+3Ul7Uv0XciFfJN55dBp9NTDG1fPulTWkAAAAAAAAAAAAAAAAAB40BWtM6l21fMqf7Cb5wS2W++H6YN9M9q+UDP0/Hk5rxKm6S1SvKOX2faw+Ol63zj7X0ZJrnpKpy6DNT03j6IKUWnhpprimmmvJm2OUOYmOJD148lFNYayujWTyYifLKtprzEsdG3hDOzFRzxwsGNaVr4hnfNkyfNMyymbUd3Pkjx7HPhMaN1Yu6+Nmk4R+Op6i+T9Z+SNds1KpWLRZsniNo+q4aH1GoU8SrvtpfDjEP/n3vPd3Ea+otPjha4Om46c35la4QUUlFJJLCSSSXgiOsYiIjaH0HoAAAAAAAAAAAAAAAAAAAAABr3VjSqrFSlCa6ThGX3PYtMeGF8dLfNCIuNTrGf8As7H8E5x+mcGyM949UW2gwW/7WnPUG0fCdaPhOH5izP7zdqnpeGfWXkNQLRcalZ+M6f4gPvNiOl4Y9Z/z9G3Q1MsY8aTn/HUm/ongxnPefVtr0/BHpulrPRtCj/pUYQ/hhFP5mub2nzKTTDjp8sQ2zFsAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/9k=",
      dob: "1988-02-14",
      gender: "male",
      address: {
        street: "No 14, Lake View Road",
        city: "Chennai",
        state: "Tamilnadu",
        country: "India",
        pincode: "600091",
      },
      role: "premium",
      status: "active",
      rating: 4.6,
      totalTrips: 158,
      availability: {
        online: true,
        lastActive: "2025-09-03T08:45:00Z",
      },
      kyc: {
        overallStatus: "verified",
        verifiedAt: "2025-09-01T11:00:00Z",
      },
      credit: {
        limit: 1000.0,
        balance: 800.0,
        totalRecharged: 1000.0,
        totalUsed: 200.0,
        lastRechargeAt: "2025-09-01T10:00:00Z",
      },
      recharges: [
        {
          transactionId: "txn-r1",
          amount: 1000.0,
          paymentMethod: "UPI",
          reference: "UPI/AXIS/12345",
          status: "success",
          createdAt: "2025-09-01T10:00:00Z",
        },
      ],
      creditUsage: [
        {
          usageId: "use-r1",
          tripId: "t1234",
          amount: 200.0,
          type: "trip_booking",
          description: "Trip ID t1234 credit hold",
          createdAt: "2025-09-02T08:00:00Z",
        },
      ],
      createdAt: "2025-09-01T12:30:00Z",
      updatedAt: "2025-09-03T09:15:00Z",
      vehicle: {
        vehicleId: "v101",
        vehicleNumber: "TN09AB1234",
        vehicleModel: "Hyundai Verna",
        vehicleType: "Sedan",
        fuelType: "Petrol",
        registrationDate: "2021-08-20",
        insuranceExpiry: "2026-08-20",
        rcDocumentUrl: "https://cdn.example.com/docs/rc_verna.pdf",
        status: true,
      },
      documents: [
        {
          documentId: "doc001",
          documentType: "license",
          documentNumber: "TN1234567890",
          documentUrl: "https://cdn.example.com/docs/license_ramesh.pdf",
          licenseStatus: "verified",
          expiryDate: "2027-01-10",
        },
      ],
      performance: {
        averageRating: 4.6,
        totalTrips: 158,
        cancellations: 12,
        lastActive: "2025-09-03T08:45:00Z",
      },
      payments: {
        totalEarnings: 85000,
        pendingPayout: 5000,
        commissionPaid: 15000,
      },
      activityLogs: [
        {
          logId: "log001",
          action: "trip_started",
          details: "Trip ID: t1234 started from Chennai",
          createdAt: "2025-09-02T08:00:00Z",
        },
      ],
    },
    {
      driverId: "drv-002",
      fullName: "Suresh Babu",
      phoneNumber: "+91-9876500002",
      email: "suresh.babu@example.com",
      profilePicUrl:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvPx5Ngn3BqU_b1o4MO5-90QnJXVEdVLYmaA&s",
      dob: "1992-05-21",
      gender: "male",
      address: {
        street: "No 22, Gandhi Nagar",
        city: "Madurai",
        state: "Tamilnadu",
        country: "India",
        pincode: "625001",
      },
      role: "normal",
      status: "pending",
      rating: 1.5,
      totalTrips: 13,
      availability: {
        online: false,
        lastActive: null,
      },
      kyc: {
        overallStatus: "pending",
        verifiedAt: null,
      },
      credit: {
        limit: 500.0,
        balance: 0.0,
        totalRecharged: 0.0,
        totalUsed: 0.0,
        lastRechargeAt: null,
      },
      recharges: [],
      creditUsage: [],
      createdAt: "2025-08-20T12:00:00Z",
      updatedAt: "2025-08-20T12:00:00Z",
      vehicle: null,
      documents: [],
      performance: {
        averageRating: 0,
        totalTrips: 0,
        cancellations: 0,
        lastActive: null,
      },
      payments: {
        totalEarnings: 100,
        pendingPayout: 0,
        commissionPaid: 0,
      },
      activityLogs: [],
    },
    {
      driverId: "drv-003",
      fullName: "Anand Raj",
      phoneNumber: "+91-9876500003",
      email: "anand.raj@example.com",
      profilePicUrl: "https://cdn.example.com/profiles/anand.jpg",
      dob: "1985-12-11",
      gender: "male",
      address: {
        street: "No 7, Anna Salai",
        city: "Coimbatore",
        state: "Tamilnadu",
        country: "India",
        pincode: "641001",
      },
      role: "elite",
      status: "active",
      rating: 4.9,
      totalTrips: 320,
      availability: {
        online: true,
        lastActive: "2025-09-03T10:15:00Z",
      },
      kyc: {
        overallStatus: "verified",
        verifiedAt: "2025-08-15T09:30:00Z",
      },
      credit: {
        limit: 3000.0,
        balance: 1500.0,
        totalRecharged: 5000.0,
        totalUsed: 3500.0,
        lastRechargeAt: "2025-08-28T14:15:00Z",
      },
      recharges: [
        {
          transactionId: "txn-a1",
          amount: 2000,
          paymentMethod: "Card",
          reference: "VISA/9876",
          status: "success",
          createdAt: "2025-08-28T14:15:00Z",
        },
      ],
      creditUsage: [
        {
          usageId: "use-a1",
          tripId: "t1002",
          amount: 500,
          type: "trip_booking",
          description: "Trip ID t1002 credit used",
          createdAt: "2025-08-29T09:30:00Z",
        },
      ],
      createdAt: "2025-08-10T11:00:00Z",
      updatedAt: "2025-09-02T12:00:00Z",
      vehicle: {
        vehicleId: "v103",
        vehicleNumber: "TN11ZZ9876",
        vehicleModel: "Toyota Innova",
        vehicleType: "SUV",
        fuelType: "Diesel",
        registrationDate: "2019-03-10",
        insuranceExpiry: "2025-03-09",
        rcDocumentUrl: "https://cdn.example.com/docs/rc_innova.pdf",
        status: true,
      },
      documents: [
        {
          documentId: "doc005",
          documentType: "license",
          documentNumber: "TN3344556677",
          documentUrl: "https://cdn.example.com/docs/license_anand.pdf",
          licenseStatus: "verified",
          expiryDate: "2028-05-20",
        },
      ],
      performance: {
        averageRating: 4.9,
        totalTrips: 320,
        cancellations: 5,
        lastActive: "2025-09-03T10:15:00Z",
      },
      payments: {
        totalEarnings: 225000,
        pendingPayout: 12000,
        commissionPaid: 45000,
      },
      activityLogs: [],
    },
    {
      driverId: "drv-004",
      fullName: "Vijay Kumar",
      phoneNumber: "+91-9876500004",
      email: "vijay.kumar@example.com",
      profilePicUrl: "https://cdn.example.com/profiles/vijay.jpg",
      dob: "1990-09-15",
      gender: "male",
      address: {
        street: "No 3, Kottur Road",
        city: "Trichy",
        state: "Tamilnadu",
        country: "India",
        pincode: "620001",
      },
      role: "normal",
      status: "blocked",
      rating: 3.2,
      totalTrips: 45,
      availability: {
        online: false,
        lastActive: "2025-08-15T16:20:00Z",
      },
      kyc: {
        overallStatus: "rejected",
        verifiedAt: null,
      },
      credit: {
        limit: 1000.0,
        balance: 50.0,
        totalRecharged: 500.0,
        totalUsed: 500.0,
        lastRechargeAt: "2025-08-10T11:00:00Z",
      },
      recharges: [
        {
          transactionId: "txn-v1",
          amount: 500,
          paymentMethod: "Wallet",
          reference: "WALLET/ICICI/2222",
          status: "failed",
          createdAt: "2025-08-10T11:00:00Z",
        },
      ],
      creditUsage: [],
      createdAt: "2025-07-01T10:00:00Z",
      updatedAt: "2025-08-15T16:20:00Z",
      vehicle: {
        vehicleId: "v104",
        vehicleNumber: "TN07QQ1234",
        vehicleModel: "Tata Indica",
        vehicleType: "Hatchback",
        fuelType: "Diesel",
        registrationDate: "2016-05-01",
        insuranceExpiry: "2024-05-01",
        rcDocumentUrl: "https://cdn.example.com/docs/rc_indica.pdf",
        status: false,
      },
      documents: [],
      performance: {
        averageRating: 3.2,
        totalTrips: 45,
        cancellations: 8,
        lastActive: "2025-08-15T16:20:00Z",
      },
      payments: {
        totalEarnings: 25000,
        pendingPayout: 0,
        commissionPaid: 2000,
      },
      activityLogs: [],
    },
    {
      driverId: "drv-005",
      fullName: "Mohammed Ali",
      phoneNumber: "+91-9876500005",
      email: "mohammed.ali@example.com",
      profilePicUrl: "https://cdn.example.com/profiles/ali.jpg",
      dob: "1995-03-05",
      gender: "male",
      address: {
        street: "No 89, ECR Road",
        city: "Pondicherry",
        state: "Puducherry",
        country: "India",
        pincode: "605001",
      },
      role: "premium",
      status: "active",
      rating: 4.4,
      totalTrips: 220,
      availability: {
        online: true,
        lastActive: "2025-09-03T11:20:00Z",
      },
      kyc: {
        overallStatus: "verified",
        verifiedAt: "2025-08-25T12:00:00Z",
      },
      credit: {
        limit: 2000.0,
        balance: 600.0,
        totalRecharged: 3000.0,
        totalUsed: 2400.0,
        lastRechargeAt: "2025-08-30T09:00:00Z",
      },
      recharges: [
        {
          transactionId: "txn-m1",
          amount: 1000,
          paymentMethod: "UPI",
          reference: "GPay/1234",
          status: "success",
          createdAt: "2025-08-30T09:00:00Z",
        },
      ],
      creditUsage: [
        {
          usageId: "use-m1",
          tripId: "t1003",
          amount: 400,
          type: "trip_booking",
          description: "Trip ID t1003 booking credit",
          createdAt: "2025-08-31T18:20:00Z",
        },
      ],
      createdAt: "2025-08-01T10:00:00Z",
      updatedAt: "2025-09-01T10:00:00Z",
      vehicle: {
        vehicleId: "v105",
        vehicleNumber: "PY01MM7654",
        vehicleModel: "Honda City",
        vehicleType: "Sedan",
        fuelType: "Petrol",
        registrationDate: "2020-06-01",
        insuranceExpiry: "2025-06-01",
        rcDocumentUrl: "https://cdn.example.com/docs/rc_city.pdf",
        status: true,
      },
      documents: [],
      performance: {
        averageRating: 4.4,
        totalTrips: 220,
        cancellations: 15,
        lastActive: "2025-09-03T11:20:00Z",
      },
      payments: {
        totalEarnings: 125000,
        pendingPayout: 8000,
        commissionPaid: 20000,
      },
      activityLogs: [],
    },
  ];
  const filterFields = [
    {
      key: "status",
      label: "Status",
      type: "select" as const,
      options: STATUSES.map((s) => ({ label: s, value: s })),
      mode: "multiple" as const,
    },
    { key: "joined_at", label: "Joined At", type: "date" as const },
  ];

  const filteredData = DATA.filter((user) => {
    if (
      filters.status.length > 0 &&
      !filters.status.includes(user.status as DriverStatus)
    ) {
      return false;
    }
    if (
      filters.joined_at &&
      !isSameDay(new Date(user.createdAt), filters.joined_at)
    ) {
      return false;
    }
    if (
      filters.license_expiry_date &&
      !isSameDay(
        new Date(user.documents?.[0]?.expiryDate),
        filters.license_expiry_date
      )
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="w-full h-full flex flex-col gap-[6px]">
      <div className="flex  p-3 bg-white shadow ">
        <div>
          <Title level={3} className="m-0">
            Driver Management
          </Title>
          <Text type="secondary">
            Manage drivers, view details, and perform administrative actions
          </Text>
        </div>
      </div>
      <Filter<Filters>
        fields={filterFields}
        initialValues={filters}
        onChange={setFilters}
      />

      <AppliedFilters<Filters>
        filters={filters}
        setFilters={setFilters}
        labels={{
          status: "Status",
          joined_at: "Joined At",
          license_expiry_date: "License Expiry Date",
        }}
        colors={{
          status: "green",
          joined_at: "purple",
          license_expiry_date: "orange",
        }}
      />

      <div className="flex-grow overflow-hidden">
        <DriverTable data={filteredData} />
      </div>
    </div>
  );
};

export default Drivers;
