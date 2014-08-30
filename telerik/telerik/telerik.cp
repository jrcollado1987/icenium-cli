/*
 *  telerik.cp
 *  telerik
 *
 *  Created by John C on 7/21/14.
 *  Copyright (c) 2014 ___ telerik___. All rights reserved.
 *
 */

#include "telerik.h"
#include "telerikPriv.h"

CFStringRef telerikUUID(void)
{
	Ctelerik* theObj = new Ctelerik;
	return theObj->UUID();
}

CFStringRef Ctelerik::UUID()
{
	return CFSTR("0001020304050607");
}
